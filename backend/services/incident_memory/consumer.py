import json
import asyncio
import structlog
import time
from aiokafka import AIOKafkaConsumer
from app.config import settings
from prometheus_client import start_http_server, Counter, Histogram
from services.incident_memory.memory_builder import memory_builder

logger = structlog.get_logger()

# Prometheus Metrics
MEMORIES_CREATED = Counter('memory_created_total', 'Total incident memories saved')
MEMORY_PROCESSING_LATENCY = Histogram('memory_processing_latency_seconds', 'Latency of memory embedding and saving')

class IncidentMemoryConsumer:
    def __init__(self):
        self.consumer = None
        self._running = False

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            settings.KAFKA_RESOLVED_INCIDENTS_TOPIC,
            bootstrap_servers=settings.KAFKA_BROKER_URL,
            group_id="memory_group",
            value_deserializer=lambda v: json.loads(v.decode('utf-8'))
        )
        await self.consumer.start()
        self._running = True
        logger.info("memory_consumer_started")

    async def stop(self):
        self._running = False
        if self.consumer:
            await self.consumer.stop()
        memory_builder.close()
        logger.info("memory_consumer_stopped")

    async def consume(self):
        logger.info("listening_to_topic", topic=settings.KAFKA_RESOLVED_INCIDENTS_TOPIC)
        try:
            async for msg in self.consumer:
                start_time = time.time()
                rca_report = msg.value
                logger.info("received_resolved_incident", incident_id=rca_report.get("incident_id"))
                
                try:
                    memory_id = memory_builder.process_resolved_incident(rca_report)
                    MEMORIES_CREATED.inc()
                    MEMORY_PROCESSING_LATENCY.observe(time.time() - start_time)
                except Exception as e:
                    logger.error("memory_creation_failed", incident_id=rca_report.get("incident_id"), error=str(e))
        except Exception as e:
            if self._running:
                logger.error("kafka_consumer_error", error=str(e))

async def main():
    start_http_server(8080)
    worker = IncidentMemoryConsumer()
    try:
        await worker.start()
        await worker.consume()
    except KeyboardInterrupt:
        logger.info("memory_worker_interrupted")
    finally:
        await worker.stop()

if __name__ == "__main__":
    asyncio.run(main())
