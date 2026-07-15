import numpy as np
import structlog
from datetime import datetime
from services.correlation.topology_builder import topology_builder

logger = structlog.get_logger()

class HybridScoringEngine:
    def __init__(self, weight_semantic: float = 0.5, weight_temporal: float = 0.2, weight_topology: float = 0.3):
        self.w_sem = weight_semantic
        self.w_temp = weight_temporal
        self.w_top = weight_topology
        # Future extensibility weights could be added here (e.g., w_memory, w_causal)

    def compute_distance_matrix(self, alerts: list, vectors: dict, topology_graph) -> np.ndarray:
        """
        Computes a pairwise distance matrix for all alerts in the buffer.
        Distance 0.0 means identical, 1.0 means completely unrelated.
        """
        n = len(alerts)
        dist_matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(i+1, n):
                a1 = alerts[i]
                a2 = alerts[j]
                
                # 1. Semantic Distance (Cosine distance: 1 - cosine_similarity)
                v1 = np.array(vectors.get(a1["id"], np.zeros(384)))
                v2 = np.array(vectors.get(a2["id"], np.zeros(384)))
                norm_v1 = np.linalg.norm(v1)
                norm_v2 = np.linalg.norm(v2)
                
                if norm_v1 > 0 and norm_v2 > 0:
                    cos_sim = np.dot(v1, v2) / (norm_v1 * norm_v2)
                    sem_dist = max(0.0, 1.0 - cos_sim)
                else:
                    sem_dist = 1.0
                
                # 2. Temporal Distance (normalized to 0-1 based on a max window of say, 300 seconds)
                try:
                    t1 = datetime.fromisoformat(a1["timestamp"].replace('Z', '+00:00'))
                    t2 = datetime.fromisoformat(a2["timestamp"].replace('Z', '+00:00'))
                    time_diff_sec = abs((t1 - t2).total_seconds())
                    temp_dist = min(time_diff_sec / 300.0, 1.0)
                except Exception:
                    temp_dist = 1.0

                # 3. Topology Distance
                top_dist = topology_builder.get_topology_distance(topology_graph, a1["id"], a2["id"])
                
                # Weighted Hybrid Distance
                hybrid_dist = (self.w_sem * sem_dist) + (self.w_temp * temp_dist) + (self.w_top * top_dist)
                
                # Symmetrical matrix
                dist_matrix[i, j] = hybrid_dist
                dist_matrix[j, i] = hybrid_dist
                
        return dist_matrix

scoring_engine = HybridScoringEngine()
