import json
import asyncio
import structlog
import time
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from app.config import settings
from services.normalization.parser import normalize_alert
from prometheus_client import start_http_server, Counter, Histogram

logger = structlog.get_logger()

# Prometheus Metrics
RAW_ALERTS_CONSUMED = Counter('normalization_raw_alerts_consumed_total', 'Total raw alerts consumed')
ALERTS_NORMALIZED = Counter('normalization_alerts_normalized_total', 'Total alerts successfully normalized')
NORMALIZATION_FAILURES = Counter('normalization_failures_total', 'Total normalization failures')
PROCESSING_LATENCY = Histogram('normalization_processing_latency_seconds', 'Latency of alert normalization')

class NormalizationConsumer:
    def __init__(self):
        self.consumer = None
        self.producer = None

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            settings.KAFKA_RAW_ALERTS_TOPIC,
            bootstrap_servers=settings.KAFKA_BROKER_URL,
            group_id="normalization_group",
            value_deserializer=lambda v: json.loads(v.decode('utf-8'))
        )
        self.producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BROKER_URL,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        
        await self.consumer.start()
        await self.producer.start()
        logger.info("normalization_consumer_started")

    async def stop(self):
        if self.consumer:
            await self.consumer.stop()
        if self.producer:
            await self.producer.stop()
        logger.info("normalization_consumer_stopped")

    async def consume(self):
        logger.info("listening_to_topic", topic=settings.KAFKA_RAW_ALERTS_TOPIC)
        try:
            async for msg in self.consumer:
                start_time = time.time()
                raw_alert = msg.value
                alert_id = raw_alert.get('id')
                logger.info("received_raw_alert", alert_id=alert_id)
                RAW_ALERTS_CONSUMED.inc()
                
                try:
                    normalized_alert = normalize_alert(raw_alert)
                    await self.producer.send_and_wait(
                        topic=settings.KAFKA_NORMALIZED_ALERTS_TOPIC,
                        value=normalized_alert
                    )
                    ALERTS_NORMALIZED.inc()
                    PROCESSING_LATENCY.observe(time.time() - start_time)
                    logger.info("published_normalized_alert", alert_id=alert_id)
                except Exception as e:
                    NORMALIZATION_FAILURES.inc()
                    logger.error("normalization_failed", alert_id=alert_id, error=str(e))
        except Exception as e:
            logger.error("kafka_consumer_error", error=str(e))

async def main():
    # Start Prometheus metrics server on port 8080
    start_http_server(8080)
    logger.info("prometheus_metrics_started", port=8080)
    
    worker = NormalizationConsumer()
    try:
        await worker.start()
        await worker.consume()
    except KeyboardInterrupt:
        logger.info("normalization_worker_interrupted")
    finally:
        await worker.stop()

if __name__ == "__main__":
    asyncio.run(main())
