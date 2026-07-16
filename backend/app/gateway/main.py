import structlog
from fastapi import FastAPI, Request, WebSocket, HTTPException, status
from fastapi.responses import StreamingResponse
import httpx
import websockets
import os
import json
from .dependencies import verify_jwt, require_admin, verify_ws_jwt
from fastapi import Depends

logger = structlog.get_logger()

app = FastAPI(
    title="IntelliRCA API Gateway",
    description="Module 2.13: Unified entry point for all frontend and external requests.",
    version="1.0.0"
)

# Target URLs for internal microservices
INGESTION_SERVICE_URL = os.getenv("INGESTION_SERVICE_URL", "http://intellirca-api:8000")
RCA_SERVICE_WS_URL = os.getenv("RCA_SERVICE_WS_URL", "ws://intellirca-rca-api:8085")
KG_SERVICE_URL = os.getenv("KG_SERVICE_URL", "http://intellirca-kg-api:8084")

http_client = httpx.AsyncClient()

@app.on_event("shutdown")
async def shutdown_event():
    await http_client.aclose()

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
