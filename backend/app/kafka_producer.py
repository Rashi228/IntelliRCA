import structlog
import json
from aiokafka import AIOKafkaProducer
from app.config import settings

logger = structlog.get_logger()

class KafkaProducerClient:
    def __init__(self):
        self.producer = None

    async def start(self):
        try:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=settings.KAFKA_BROKER_URL,
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
            await self.producer.start()
            logger.info("kafka_producer_connected", broker=settings.KAFKA_BROKER_URL)
        except Exception as e:
            logger.error("kafka_producer_connection_failed", error=str(e))
            self.producer = None

    async def stop(self):
        if self.producer:
            await self.producer.stop()
            logger.info("kafka_producer_stopped")

    async def send_alert(self, alert_data: dict):
        if not self.producer:
            logger.error("kafka_producer_not_initialized")
            raise ConnectionError("Kafka producer not initialized.")
        
        try:
            await self.producer.send_and_wait(
                topic=settings.KAFKA_RAW_ALERTS_TOPIC,
                value=alert_data
            )
            logger.info("kafka_message_sent", alert_id=alert_data.get('id'), topic=settings.KAFKA_RAW_ALERTS_TOPIC)
        except Exception as e:
            logger.error("kafka_message_failed", error=str(e))
            raise

kafka_client = KafkaProducerClient()
