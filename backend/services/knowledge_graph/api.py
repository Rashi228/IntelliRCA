import structlog
from fastapi import FastAPI, HTTPException, status, Query
from prometheus_client import make_asgi_app
from services.knowledge_graph.graph_query import graph_query

logger = structlog.get_logger()

app = FastAPI(
    title="IntelliRCA Knowledge Graph API",
    description="Module 2.5: Exposes Graph Query operations for RCA Agents.",
    version="1.0.0"
)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.on_event("shutdown")
def shutdown_event():
    graph_query.close()

@app.get("/api/v1/graph/incident/{incident_id}")
async def get_incident_subgraph(incident_id: str, depth: int = Query(2, ge=1, le=5)):
    logger.info("api_graph_query_requested", incident_id=incident_id, depth=depth)
    try:
        subgraph = graph_query.get_incident_subgraph(incident_id, depth=depth)
        if not subgraph.get("nodes"):
            raise HTTPException(status_code=404, detail="Incident graph not found.")
            
        logger.info("api_graph_query_success", incident_id=incident_id)
        return {
            "status": "success",
            "incident_id": incident_id,
            "depth": depth,
            "subgraph": subgraph
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("api_graph_query_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Graph query failed: {str(e)}"
        )

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "healthy", "service": "kg_api"}
