from sklearn.cluster import HDBSCAN
import structlog
import uuid
import datetime
import numpy as np

logger = structlog.get_logger()

class ClusterEngine:
    def __init__(self, min_cluster_size=2):
        self.min_cluster_size = min_cluster_size

    def discover_incidents(self, alerts: list, distance_matrix: np.ndarray) -> list:
        if len(alerts) < self.min_cluster_size:
            logger.info("not_enough_alerts_to_cluster", count=len(alerts))
            return []

        try:
            # Run HDBSCAN on precomputed distance matrix
            clusterer = HDBSCAN(
                min_cluster_size=self.min_cluster_size,
                metric='precomputed'
            )
            labels = clusterer.fit_predict(distance_matrix)
            
            # Group alerts by label
            clusters = {}
            for idx, label in enumerate(labels):
                if label == -1:
                    continue # Noise / unclustered
                if label not in clusters:
                    clusters[label] = []
                clusters[label].append(alerts[idx])

            incidents = []
            for label, cluster_alerts in clusters.items():
                incident = self._generate_structured_incident(cluster_alerts, distance_matrix, labels, label)
                incidents.append(incident)
                
            logger.info("incidents_discovered", count=len(incidents))
            return incidents

        except Exception as e:
            logger.error("clustering_failed", error=str(e))
            return []

    def _generate_structured_incident(self, alerts: list, distance_matrix: np.ndarray, all_labels: np.ndarray, cluster_label: int) -> dict:
        """
        Transforms a raw cluster of alerts into a highly structured Incident object.
        """
        # Sort alerts chronologically
        try:
            alerts = sorted(alerts, key=lambda x: x.get("timestamp", ""))
        except Exception:
            pass

        # Calculate a pseudo "Correlation Confidence" based on the tightness of the cluster
        # Lower average intra-cluster distance = higher confidence
        indices = np.where(all_labels == cluster_label)[0]
        if len(indices) > 1:
            sub_matrix = distance_matrix[np.ix_(indices, indices)]
            avg_dist = np.mean(sub_matrix[np.triu_indices_from(sub_matrix, k=1)])
            confidence = max(0.0, 1.0 - avg_dist) # 1.0 is perfect confidence
        else:
            confidence = 1.0
            
        root_candidate = alerts[0] # Earliest alert is often the best initial candidate for root cause

        affected_services = list(set([a.get("metadata", {}).get("service") for a in alerts if a.get("metadata", {}).get("service")]))
        affected_hosts = list(set([a.get("metadata", {}).get("host") for a in alerts if a.get("metadata", {}).get("host")]))
        
        # Determine overall severity (max of components)
        severities = [a.get("severity", "INFO").upper() for a in alerts]
        if "CRITICAL" in severities:
            overall_severity = "CRITICAL"
        elif "WARNING" in severities:
            overall_severity = "WARNING"
        else:
            overall_severity = "INFO"

        incident_obj = {
            "incident_id": f"INC-{str(uuid.uuid4())[:8].upper()}",
            "created_timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "root_candidate_alert": root_candidate.get("id"),
            "member_alerts": [a.get("id") for a in alerts],
            "correlation_confidence": round(confidence, 4),
            "time_window": {
                "start": alerts[0].get("timestamp"),
                "end": alerts[-1].get("timestamp")
            },
            "affected_services": affected_services,
            "affected_hosts": affected_hosts,
            "severity": overall_severity,
            "cluster_size": len(alerts)
        }
        return incident_obj

cluster_engine = ClusterEngine()
