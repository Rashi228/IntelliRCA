import json
import asyncio
import structlog
import time
from aiokafka import AIOKafkaConsumer
from app.config import settings
from prometheus_client import start_http_server, Counter, Histogram
from services.knowledge_graph.graph_builder import graph_builder

logger = structlog.get_logger()

# Prometheus Metrics
INCIDENTS_CONSUMED = Counter('kg_incidents_consumed_total', 'Total incidents consumed from Kafka')
GRAPH_WRITES_SUCCESS = Counter('kg_writes_success_total', 'Total successful graph ingestions')
GRAPH_WRITES_FAILED = Counter('kg_writes_failed_total', 'Total failed graph ingestions')
PROCESSING_LATENCY = Histogram('kg_processing_latency_seconds', 'Latency of graph ingestion')

class KnowledgeGraphConsumer:
    def __init__(self):
        self.consumer = None
        self._running = False

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            settings.KAFKA_ACTIVE_INCIDENTS_TOPIC,
            bootstrap_servers=settings.KAFKA_BROKER_URL,
            group_id="kg_group",
            value_deserializer=lambda v: json.loads(v.decode('utf-8'))
        )
        await self.consumer.start()
        self._running = True
        logger.info("kg_consumer_started")

    async def stop(self):
        self._running = False
        if self.consumer:
            await self.consumer.stop()
        graph_builder.close()
        logger.info("kg_consumer_stopped")

    async def consume(self):
        logger.info("listening_to_topic", topic=settings.KAFKA_ACTIVE_INCIDENTS_TOPIC)
        try:
            async for msg in self.consumer:
                start_time = time.time()
                incident = msg.value
                logger.info("received_incident_for_graph", incident_id=incident.get("incident_id"))
                INCIDENTS_CONSUMED.inc()
                
                try:
                    # Persist Incident to Neo4j
                    graph_builder.ingest_incident(incident)
                    GRAPH_WRITES_SUCCESS.inc()
                    PROCESSING_LATENCY.observe(time.time() - start_time)
                except Exception as e:
                    GRAPH_WRITES_FAILED.inc()
                    logger.error("kg_ingestion_error", incident_id=incident.get("incident_id"), error=str(e))
        except Exception as e:
            if self._running:
                logger.error("kafka_consumer_error", error=str(e))

async def main():
    # Start Prometheus metrics server on port 8080
    start_http_server(8080)
    logger.info("prometheus_metrics_started", port=8080)
    
    worker = KnowledgeGraphConsumer()
    try:
        await worker.start()
        await worker.consume()
    except KeyboardInterrupt:
        logger.info("kg_worker_interrupted")
    finally:
        await worker.stop()

if __name__ == "__main__":
    asyncio.run(main())
