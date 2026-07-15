import json
import logging
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from app.config import settings
from services.normalization.parser import normalize_alert

logger = logging.getLogger(__name__)

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
        logger.info("Normalization Consumer and Producer started.")

    async def stop(self):
        if self.consumer:
            await self.consumer.stop()
        if self.producer:
            await self.producer.stop()
        logger.info("Normalization Consumer stopped.")

    async def consume(self):
        logger.info(f"Listening to topic: {settings.KAFKA_RAW_ALERTS_TOPIC}")
        try:
            async for msg in self.consumer:
                raw_alert = msg.value
                logger.info(f"Received raw alert: {raw_alert.get('id')}")
                
                try:
                    normalized_alert = normalize_alert(raw_alert)
                    await self.producer.send_and_wait(
                        topic=settings.KAFKA_NORMALIZED_ALERTS_TOPIC,
                        value=normalized_alert
                    )
                    logger.info(f"Published normalized alert: {normalized_alert.get('id')}")
                except Exception as e:
                    logger.error(f"Failed to normalize/publish alert {raw_alert.get('id')}: {e}")
        except Exception as e:
            logger.error(f"Kafka consumer error: {e}")
