from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

class EmbeddingEngine:
    def __init__(self, model_name="BAAI/bge-small-en-v1.5"):
        self.model_name = model_name
        logger.info(f"Loading embedding model: {self.model_name}")
        # Note: In production, we'd cache this or run via ONNX, but sentence_transformers is fine for this architecture.
        self.model = SentenceTransformer(self.model_name)
        logger.info("Model loaded successfully.")

    def embed_alert(self, text: str) -> list[float]:
        # BGE models perform best with an instruction prefix for retrieval tasks, but for symmetrical clustering, raw text is fine.
        embedding = self.model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

embedding_engine = EmbeddingEngine()
