import asyncio
import structlog
from fastapi import FastAPI
from prometheus_client import make_asgi_app
import uvicorn
from services.correlation.consumer import CorrelationConsumer

logger = structlog.get_logger()

# Setup FastAPI for Health and Metrics
app = FastAPI(title="Correlation Engine Worker")
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

correlation_engine = CorrelationConsumer(window_interval_seconds=30)

@app.on_event("startup")
async def startup_event():
    logger.info("correlation_worker_api_started")
    # Start the Kafka consumer and the clustering loop in the background
    asyncio.create_task(correlation_engine.start())
    asyncio.create_task(correlation_engine.consume_loop())
    asyncio.create_task(correlation_engine.correlation_cycle())

@app.on_event("shutdown")
async def shutdown_event():
    await correlation_engine.stop()

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/ready")
async def ready():
    if correlation_engine._running:
        return {"status": "ready"}
    return {"status": "not_ready"}, 503

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8082)
