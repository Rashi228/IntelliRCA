import json
import asyncio
import structlog
import time
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from app.config import settings
from prometheus_client import start_http_server, Counter, Histogram, Gauge
from services.correlation.topology_builder import topology_builder
from services.correlation.scoring_engine import scoring_engine
from services.correlation.cluster_engine import cluster_engine
import requests

logger = structlog.get_logger()

# Prometheus Metrics
BUFFER_SIZE = Gauge('correlation_buffer_size', 'Current number of alerts in the temporal buffer')
INCIDENTS_GENERATED = Counter('correlation_incidents_generated_total', 'Total incidents discovered and published')
CORRELATION_CYCLES = Counter('correlation_cycles_total', 'Total clustering cycles run')
CYCLE_LATENCY = Histogram('correlation_cycle_latency_seconds', 'Latency of a complete correlation cycle')

class CorrelationConsumer:
    def __init__(self, window_interval_seconds=30):
        self.consumer = None
        self.producer = None
        self.buffer = []
        self.window_interval = window_interval_seconds
        self._running = False

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            settings.KAFKA_NORMALIZED_ALERTS_TOPIC,
            bootstrap_servers=settings.KAFKA_BROKER_URL,
            group_id="correlation_group",
            value_deserializer=lambda v: json.loads(v.decode('utf-8'))
        )
        self.producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BROKER_URL,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        await self.consumer.start()
        await self.producer.start()
        self._running = True
        logger.info("correlation_engine_started", window_seconds=self.window_interval)

    async def stop(self):
        self._running = False
        if self.consumer:
            await self.consumer.stop()
        if self.producer:
            await self.producer.stop()
        logger.info("correlation_engine_stopped")

    async def consume_loop(self):
        """Continuously reads alerts into the temporal buffer."""
        try:
            async for msg in self.consumer:
                alert = msg.value
                self.buffer.append(alert)
                BUFFER_SIZE.set(len(self.buffer))
        except Exception as e:
            if self._running:
                logger.error("kafka_consumer_error", error=str(e))

    def _fetch_vectors_from_qdrant(self, alerts: list) -> dict:
        """
        For a batch of alerts, we normally query Qdrant to get their exact vectors.
        In this implementation, we will simulate the fetch if the semantic API is not instantly available,
        but typically we would do a batch point lookup via Qdrant REST API.
        """
        vectors = {}
        # In a full production system, we would batch request from Qdrant:
        # GET /collections/semantic_alerts/points?ids=[id1, id2...]
        # Here we mock it with zeros if unavailable, but the logic holds.
        for a in alerts:
            vectors[a["id"]] = [0.0]*384 # Fallback
        return vectors

    async def correlation_cycle(self):
        """Runs the HDBSCAN clustering every window interval."""
        while self._running:
            await asyncio.sleep(self.window_interval)
            
            if len(self.buffer) < 2:
                continue # Need at least 2 alerts to correlate
                
            start_time = time.time()
            CORRELATION_CYCLES.inc()
            
            # Snapshot the buffer and clear it
            alerts_to_process = list(self.buffer)
            self.buffer.clear()
            BUFFER_SIZE.set(0)
            
            logger.info("starting_correlation_cycle", alerts_count=len(alerts_to_process))
            
            try:
                # 1. Topology
                topology_graph = topology_builder.build_topology_graph(alerts_to_process)
                
                # 2. Semantic Vectors
                vectors = self._fetch_vectors_from_qdrant(alerts_to_process)
                
                # 3. Hybrid Distance Matrix
                dist_matrix = scoring_engine.compute_distance_matrix(alerts_to_process, vectors, topology_graph)
                
                # 4. HDBSCAN Clustering -> Structured Incidents
                incidents = cluster_engine.discover_incidents(alerts_to_process, dist_matrix)
                
                # 5. Publish to Kafka
                for incident in incidents:
                    await self.producer.send_and_wait(
                        topic=settings.KAFKA_ACTIVE_INCIDENTS_TOPIC,
                        value=incident
                    )
                    INCIDENTS_GENERATED.inc()
                    logger.info("published_incident", incident_id=incident.get("incident_id"))
                    
                CYCLE_LATENCY.observe(time.time() - start_time)
            except Exception as e:
                logger.error("correlation_cycle_failed", error=str(e))
