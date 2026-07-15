import structlog
from fastapi import FastAPI, HTTPException, status, Query
from pydantic import BaseModel
from prometheus_client import make_asgi_app
from services.incident_memory.memory_query import memory_query
from services.incident_memory.memory_builder import memory_builder
from typing import Optional

logger = structlog.get_logger()

app = FastAPI(
    title="IntelliRCA Memory API",
    description="Module 2.6: Search historical incidents and submit memory feedback.",
    version="1.0.0"
)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

class MemoryFeedback(BaseModel):
    incident_id: str
    corrected_root_cause: Optional[str] = None
    corrected_remediation: Optional[str] = None
    severity: str
    affected_services: list

@app.get("/api/v1/memory/similar")
async def search_similar_memories(
    query: str, 
    service: Optional[str] = None, 
    severity: Optional[str] = None,
    limit: int = Query(5, ge=1, le=20)
):
    logger.info("memory_search_requested", query=query, service=service)
    try:
        results = memory_query.search_memories(query, service=service, severity=severity, top_k=limit)
        return {
            "status": "success",
            "results": results
        }
    except Exception as e:
        logger.error("memory_search_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Memory search failed: {str(e)}"
        )

@app.post("/api/v1/memory/feedback")
async def submit_memory_feedback(feedback: MemoryFeedback):
    """
    Submits engineer feedback which creates a new Version of the memory.
    """
    logger.info("memory_feedback_received", incident_id=feedback.incident_id)
    try:
        # We re-use the memory_builder to process a new version.
        # It automatically detects if the memory exists and increments the version.
        simulated_rca = {
            "incident_id": feedback.incident_id,
            "root_cause": feedback.corrected_root_cause,
            "recommended_remediation": feedback.corrected_remediation,
            "affected_services": feedback.affected_services,
            "severity": feedback.severity,
            "business_impact": "Updated via Engineer Feedback",
            "confidence_score": 1.0 # Engineer feedback implies 100% confidence
        }
        
        new_memory_id = memory_builder.process_resolved_incident(simulated_rca)
        
        return {
            "status": "success",
            "message": "Memory version incremented.",
            "memory_id": new_memory_id
        }
    except Exception as e:
        logger.error("memory_feedback_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process memory feedback: {str(e)}"
        )

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "healthy", "service": "memory_api"}
