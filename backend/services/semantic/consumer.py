import json
import asyncio
import uuid
import structlog
import time
from aiokafka import AIOKafkaConsumer
from app.config import settings
from services.semantic.embedding_engine import embedding_engine
from services.semantic.qdrant_store import qdrant_store
from prometheus_client import start_http_server, Counter, Histogram

logger = structlog.get_logger()

# Prometheus Metrics
ALERTS_PROCESSED = Counter('semantic_alerts_processed_total', 'Total normalized alerts processed')
EMBEDDINGS_GENERATED = Counter('semantic_embeddings_generated_total', 'Total embeddings generated')
ALERTS_FAILED = Counter('semantic_alerts_failed_total', 'Total alerts failed to process')
PROCESSING_LATENCY = Histogram('semantic_processing_latency_seconds', 'Latency of embedding generation and storage')

class SemanticConsumer:
    def __init__(self):
        self.consumer = None

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            settings.KAFKA_NORMALIZED_ALERTS_TOPIC,
            bootstrap_servers=settings.KAFKA_BROKER_URL,
            group_id="semantic_group",
            value_deserializer=lambda v: json.loads(v.decode('utf-8'))
        )
        await self.consumer.start()
        logger.info("semantic_worker_started")

    async def stop(self):
        if self.consumer:
            await self.consumer.stop()
        logger.info("semantic_worker_stopped")

    async def consume(self):
        logger.info("listening_to_topic", topic=settings.KAFKA_NORMALIZED_ALERTS_TOPIC)
        try:
            async for msg in self.consumer:
                start_time = time.time()
                alert = msg.value
                alert_id = alert.get("id", str(uuid.uuid4()))
                logger.info("received_normalized_alert", alert_id=alert_id)
                ALERTS_PROCESSED.inc()
                
                text_to_embed = f"{alert.get('title', '')}. {alert.get('normalized_template', '')}. {alert.get('original_description', '')}"
                
                try:
                    # Enriched Metadata extraction
                    metadata = alert.get("metadata", {})
                    
                    vector = embedding_engine.embed_alert(text_to_embed)
                    EMBEDDINGS_GENERATED.inc()
                    
                    payload = {
                        "alert_id": alert_id,
                        "incident_id": metadata.get("incident_id", None),
                        "correlation_id": metadata.get("correlation_id", None),
                        "service": metadata.get("service", "unknown"),
                        "host": metadata.get("host", "unknown"),
                        "namespace": metadata.get("namespace", "unknown"),
                        "cluster": metadata.get("cluster", "unknown"),
                        "environment": metadata.get("environment", "unknown"),
                        "region": metadata.get("region", "unknown"),
                        "severity": alert.get("severity"),
                        "timestamp": alert.get("timestamp"),
                        "source": alert.get("source"),
                        "model_version": embedding_engine.model_name,
                        "embedding_dimension": 384,
                        "title": alert.get("title"),
                        "normalized_template": alert.get("normalized_template")
                    }
                    
                    qdrant_store.upsert_alert(alert_id, vector, payload)
                    PROCESSING_LATENCY.observe(time.time() - start_time)
                except Exception as e:
                    ALERTS_FAILED.inc()
                    logger.error("semantic_processing_failed", alert_id=alert_id, error=str(e))
        except Exception as e:
            logger.error("kafka_consumer_error", error=str(e))

async def main():
    # Start Prometheus metrics server on port 8080
    start_http_server(8080)
    logger.info("prometheus_metrics_started", port=8080)
    
    worker = SemanticConsumer()
    try:
        await worker.start()
        await worker.consume()
    except KeyboardInterrupt:
        logger.info("semantic_worker_interrupted")
    finally:
        await worker.stop()

if __name__ == "__main__":
    asyncio.run(main())
