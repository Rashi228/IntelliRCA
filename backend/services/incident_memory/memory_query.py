import structlog
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from app.config import settings
from services.semantic.embedding_engine import embedding_engine
from typing import List, Optional

logger = structlog.get_logger()

class MemoryQuery:
    def __init__(self):
        self.qdrant = QdrantClient(url=settings.QDRANT_URL)
        self.collection_name = "memory_embeddings"
        self.embedding_engine = embedding_engine

    def search_memories(
        self, 
        query: str, 
        service: Optional[str] = None, 
        severity: Optional[str] = None,
        top_k: int = 5
    ) -> List[dict]:
        """
        Perform a semantic search against historical incident memories with optional metadata filtering.
        """
        logger.info("searching_memories", query=query, service=service, severity=severity)
        
        # Embed the query
        query_vector = self.embedding_engine.generate_embedding(query)
        
        # Build Filter if metadata is provided
        must_conditions = []
        if service:
            must_conditions.append(
                qmodels.FieldCondition(
                    key="affected_services",
                    match=qmodels.MatchValue(value=service)
                )
            )
        if severity:
            must_conditions.append(
                qmodels.FieldCondition(
                    key="severity",
                    match=qmodels.MatchValue(value=severity)
                )
            )
            
        search_filter = None
        if must_conditions:
            search_filter = qmodels.Filter(must=must_conditions)
            
        try:
            results = self.qdrant.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=search_filter,
                limit=top_k,
                with_payload=True
            )
            
            # Format results
            formatted_results = []
            for hit in results:
                formatted_results.append({
                    "similarity_score": round(hit.score, 4),
                    "memory_id": hit.payload.get("memory_id"),
                    "incident_id": hit.payload.get("incident_id"),
                    "memory_version": hit.payload.get("memory_version"),
                    "root_cause": hit.payload.get("root_cause"),
                    "recommended_remediation": hit.payload.get("recommended_remediation"),
                    "affected_services": hit.payload.get("affected_services"),
                    "timestamp": hit.payload.get("timestamp")
                })
                
            logger.info("memory_search_success", count=len(formatted_results))
            return formatted_results
            
        except Exception as e:
            logger.error("memory_search_failed", error=str(e))
            return []

memory_query = MemoryQuery()
