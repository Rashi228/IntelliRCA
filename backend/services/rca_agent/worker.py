import asyncio
import structlog
from fastapi import FastAPI
import uvicorn
from prometheus_client import make_asgi_app

logger = structlog.get_logger()

app = FastAPI(title="RCA Background Worker")
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/ready")
async def ready():
    return {"status": "ready"}

if __name__ == "__main__":
    logger.info("Starting RCA metrics/health worker...")
    uvicorn.run(app, host="0.0.0.0", port=8086)
