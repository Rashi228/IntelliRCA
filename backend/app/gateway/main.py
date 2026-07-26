import structlog
from fastapi import FastAPI, Request, WebSocket, HTTPException, status
from fastapi.responses import StreamingResponse
import httpx
import websockets
import os
import json
import asyncio
from .dependencies import verify_jwt, require_admin, verify_ws_jwt
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
from aiokafka import AIOKafkaConsumer

logger = structlog.get_logger()

app = FastAPI(
    title="IntelliRCA API Gateway",
    description="Module 2.13: Unified entry point for all frontend and external requests.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow localhost:5173 and all dev origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Target URLs for internal microservices
INGESTION_SERVICE_URL = os.getenv("INGESTION_SERVICE_URL", "http://intellirca-api:8000")
RCA_SERVICE_WS_URL = os.getenv("RCA_SERVICE_WS_URL", "ws://intellirca-rca-api:8085")
KG_SERVICE_URL = os.getenv("KG_SERVICE_URL", "http://intellirca-kg-api:8084")
KAFKA_BROKER_URL = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
KAFKA_ACTIVE_INCIDENTS_TOPIC = os.getenv("KAFKA_ACTIVE_INCIDENTS_TOPIC", "incidents.active")

http_client = httpx.AsyncClient()

# Store the latest auto-generated incident for the frontend to poll
LATEST_INCIDENT = None

async def consume_incidents():
    global LATEST_INCIDENT
    while True:
        try:
            consumer = AIOKafkaConsumer(
                KAFKA_ACTIVE_INCIDENTS_TOPIC,
                bootstrap_servers=KAFKA_BROKER_URL,
                group_id="gateway_polling_group",
                value_deserializer=lambda v: json.loads(v.decode('utf-8'))
            )
            await consumer.start()
            logger.info("gateway_incident_consumer_started")
            async for msg in consumer:
                LATEST_INCIDENT = msg.value
                logger.info("gateway_cached_new_incident", incident_id=msg.value.get("incident_id"))
        except Exception as e:
            logger.error("gateway_incident_consumer_failed", error=str(e))
            await asyncio.sleep(3)
        finally:
            try:
                await consumer.stop()
            except Exception:
                pass

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(consume_incidents())

@app.on_event("shutdown")
async def shutdown_event():
    await http_client.aclose()

@app.get("/api/v1/incidents/latest")
async def get_latest_incident():
    return {"status": "success", "incident": LATEST_INCIDENT}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api_gateway"}

# Proxy HTTP POST to Ingestion Service (Admin Only for Simulations)
@app.post("/api/v1/alerts/ingest")
async def proxy_ingest_alert(request: Request, user: dict = Depends(require_admin)):
    url = f"{INGESTION_SERVICE_URL}/api/v1/alerts/ingest"
    body = await request.body()
    try:
        response = await http_client.post(
            url, 
            content=body, 
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except httpx.RequestError as e:
        logger.error("gateway_proxy_failed", target="ingestion_service", error=str(e))
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Ingestion service is unavailable.")

# Ingest Prometheus Alertmanager Webhooks (Public Endpoint for external monitoring)
@app.post("/api/v1/alerts/prometheus_webhook")
async def prometheus_webhook(request: Request):
    try:
        body = await request.json()
        alerts = body.get("alerts", [])
        
        processed_count = 0
        for alert in alerts:
            # Only process 'firing' alerts (ignore 'resolved' for now)
            if alert.get("status") != "firing":
                continue
                
            labels = alert.get("labels", {})
            annotations = alert.get("annotations", {})
            
            # Map Prometheus Alert to IntelliRCA StandardAlert
            standard_alert = {
                "source": "Prometheus Alertmanager",
                "severity": labels.get("severity", "CRITICAL").upper(),
                "title": annotations.get("title", labels.get("alertname", "Unknown Prometheus Alert")),
                "description": annotations.get("description", "No description provided."),
                "metadata": {
                    "service": labels.get("service", "unknown"),
                    "component": labels.get("component", "unknown"),
                    "prometheus_fingerprint": alert.get("fingerprint", "")
                }
            }
            
            # Forward to internal ingestion service
            url = f"{INGESTION_SERVICE_URL}/api/v1/alerts/ingest"
            await http_client.post(
                url, 
                json=standard_alert, 
                headers={"Content-Type": "application/json"}
            )
            processed_count += 1
            
        logger.info("prometheus_webhook_processed", count=processed_count)
        return {"status": "success", "message": f"Processed {processed_count} alerts"}
    except Exception as e:
        logger.error("prometheus_webhook_failed", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Proxy WebSocket to RCA Engine
@app.websocket("/ws/rca/{incident_id}")
async def websocket_proxy(websocket: WebSocket, incident_id: str):
    user = await verify_ws_jwt(websocket)
    if not user:
        return
        
    await websocket.accept()
    target_ws_url = f"{RCA_SERVICE_WS_URL}/ws/internal/rca/{incident_id}"
    
    logger.info("gateway_ws_connection_established", incident_id=incident_id, user=user.get("sub"))
    
    try:
        async with websockets.connect(target_ws_url) as target_ws:
            # We need to bridge the connection: Frontend <-> Gateway <-> RCA Service
            import asyncio
            
            async def forward_to_target():
                try:
                    while True:
                        data = await websocket.receive_text()
                        await target_ws.send(data)
                except Exception as e:
                    logger.warning("ws_frontend_disconnect", error=str(e))

            async def forward_to_client():
                try:
                    while True:
                        message = await target_ws.recv()
                        await websocket.send_text(message)
                except Exception as e:
                    logger.warning("ws_target_disconnect", error=str(e))
            
            await asyncio.gather(
                forward_to_target(),
                forward_to_client()
            )
    except Exception as e:
        logger.error("gateway_ws_proxy_failed", error=str(e))
        await websocket.close(code=1011, reason="Upstream RCA service unavailable.")
