import structlog
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from prometheus_client import make_asgi_app
from services.semantic.embedding_engine import embedding_engine
from services.semantic.qdrant_store import qdrant_store

logger = structlog.get_logger()

app = FastAPI(
    title="IntelliRCA Semantic Search API",
    description="Module 2.3: Exposes vector similarity search for historical alerts.",
    version="1.0.0"
)

# Add prometheus asgi middleware to route /metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

class SearchQuery(BaseModel):
    query_text: str
    limit: int = 5

@app.post("/api/v1/semantic/search")
async def search_similar_alerts(query: SearchQuery):
    logger.info("semantic_search_requested", query=query.query_text, limit=query.limit)
    try:
        query_vector = embedding_engine.embed_alert(query.query_text)
        results = qdrant_store.search_similar(query_vector, limit=query.limit)
        
        formatted_results = []
        for point in results:
            formatted_results.append({
                "alert_id": point.id,
                "score": point.score, # Explicit similarity score for downstream correlation
                "payload": point.payload
            })
            
        logger.info("semantic_search_success", results_found=len(formatted_results))
        return {
            "status": "success",
            "results": formatted_results
        }
    except Exception as e:
        logger.error("semantic_search_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic search failed: {str(e)}"
        )

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "healthy", "service": "semantic_api"}
