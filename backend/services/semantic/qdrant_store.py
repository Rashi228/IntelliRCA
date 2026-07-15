import structlog
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
from app.config import settings

logger = structlog.get_logger()

# Define future collections for a robust architecture
COLLECTIONS = [
    settings.QDRANT_ALERTS_COLLECTION,
    "incident_embeddings",
    "memory_embeddings",
    "runbook_embeddings"
]

class QdrantStore:
    def __init__(self):
        self.client = QdrantClient(url=settings.QDRANT_URL)
        self._ensure_collections()

    def _ensure_collections(self):
        try:
            existing_collections = [c.name for c in self.client.get_collections().collections]
            for col_name in COLLECTIONS:
                if col_name not in existing_collections:
                    logger.info("creating_qdrant_collection", collection=col_name)
                    self.client.create_collection(
                        collection_name=col_name,
                        vectors_config=rest.VectorParams(
                            size=384, # BGE-small embedding size
                            distance=rest.Distance.COSINE
                        )
                    )
        except Exception as e:
            logger.error("qdrant_collection_init_failed", error=str(e))

    def upsert_alert(self, alert_id: str, vector: list[float], payload: dict):
        try:
            self.client.upsert(
                collection_name=settings.QDRANT_ALERTS_COLLECTION,
                points=[
                    rest.PointStruct(
                        id=alert_id,
                        vector=vector,
                        payload=payload
                    )
                ]
            )
            logger.info("qdrant_upsert_success", alert_id=alert_id)
        except Exception as e:
            logger.error("qdrant_upsert_failed", alert_id=alert_id, error=str(e))

    def search_similar(self, query_vector: list[float], limit: int = 5, collection_name: str = None):
        target_collection = collection_name or settings.QDRANT_ALERTS_COLLECTION
        try:
            return self.client.search(
                collection_name=target_collection,
                query_vector=query_vector,
                limit=limit
            )
        except Exception as e:
            logger.error("qdrant_search_failed", collection=target_collection, error=str(e))
            return []

qdrant_store = QdrantStore()
