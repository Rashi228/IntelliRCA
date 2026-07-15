import structlog
from fastapi import FastAPI, HTTPException, status
from contextlib import asynccontextmanager
from prometheus_client import make_asgi_app, Counter
from app.schemas import StandardAlert
from app.kafka_producer import kafka_client

logger = structlog.get_logger()

# Metrics
ALERTS_INGESTED = Counter('api_alerts_ingested_total', 'Total alerts accepted by API')
ALERTS_REJECTED = Counter('api_alerts_rejected_total', 'Total alerts rejected by API')

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("api_startup_initiating")
    await kafka_client.start()
    yield
    logger.info("api_shutdown_initiating")
    await kafka_client.stop()

app = FastAPI(
    title="IntelliRCA Alert Ingestion Service",
    description="Module 2.1: Ingests raw alerts, validates them, and pushes to Kafka stream.",
    version="1.0.0",
    lifespan=lifespan
)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.post("/api/v1/alerts/ingest", status_code=status.HTTP_202_ACCEPTED)
async def ingest_alert(alert: StandardAlert):
    logger.info("api_ingest_request_received", alert_id=alert.id, source=alert.source)
    try:
        alert_dict = alert.model_dump(mode='json')
        await kafka_client.send_alert(alert_dict)
        ALERTS_INGESTED.inc()
        
        logger.info("api_ingest_success", alert_id=alert.id)
        return {
            "status": "accepted",
            "message": "Alert successfully ingested and pushed to stream.",
            "alert_id": alert.id
        }
    except ConnectionError:
        ALERTS_REJECTED.inc()
        logger.error("api_ingest_failed_kafka_unavailable", alert_id=alert.id)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="Kafka broker is currently unavailable. Alert rejected."
        )
    except Exception as e:
        ALERTS_REJECTED.inc()
        logger.error("api_ingest_failed_internal_error", alert_id=alert.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process alert: {str(e)}"
        )

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "healthy", "service": "alert_ingestion"}
