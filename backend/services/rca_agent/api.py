import structlog
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from prometheus_client import make_asgi_app
from services.rca_agent.workflow import rca_workflow
from services.rca_agent.evidence_builder import evidence_builder

logger = structlog.get_logger()

app = FastAPI(
    title="IntelliRCA Multi-Agent System",
    description="Module 2.6: Triggers the RCA LangGraph.",
    version="1.0.0"
)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

class RCAQuery(BaseModel):
    incident_id: str
    raw_incident_data: dict

@app.post("/api/v1/rca/analyze")
async def analyze_incident(query: RCAQuery):
    logger.info("rca_analysis_requested", incident_id=query.incident_id)
    try:
        # 1. Build Evidence before reasoning
        evidence = evidence_builder.gather_evidence(query.incident_id, query.raw_incident_data)
        
        # 2. Initialize State
        initial_state = {
            "incident_id": query.incident_id,
            "raw_incident_data": query.raw_incident_data,
            "evidence": evidence
        }
        
        # 3. Invoke Graph
        final_state = rca_workflow.invoke(initial_state)
        
        logger.info("rca_analysis_complete", incident_id=query.incident_id)
        return {
            "status": "success",
            "rca_report": final_state.get("final_rca_report")
        }
    except Exception as e:
        logger.error("rca_analysis_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RCA generation failed: {str(e)}"
        )

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "healthy", "service": "rca_api"}
