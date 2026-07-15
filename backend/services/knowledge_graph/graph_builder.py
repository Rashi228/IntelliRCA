from neo4j import GraphDatabase
import structlog
from app.config import settings
import datetime

logger = structlog.get_logger()

class GraphBuilder:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )

    def close(self):
        self.driver.close()

    def ingest_incident(self, incident: dict):
        """
        Takes a structured Incident object and merges it into the Neo4j Graph.
        """
        incident_id = incident.get("incident_id")
        created_timestamp = incident.get("created_timestamp", datetime.datetime.utcnow().isoformat() + "Z")
        
        with self.driver.session() as session:
            try:
                # 1. Merge the Incident Node
                session.run("""
                    MERGE (i:Incident {id: $incident_id})
                    SET i.correlation_confidence = $confidence,
                        i.severity = $severity,
                        i.created_timestamp = $created,
                        i.time_window_start = $window_start,
                        i.time_window_end = $window_end,
                        i.root_candidate_alert = $root_candidate,
                        i.cluster_size = $size,
                        i.processing_status = 'Active',
                        i.graph_version = '1.0'
                """, {
                    "incident_id": incident_id,
                    "confidence": incident.get("correlation_confidence", 1.0),
                    "severity": incident.get("severity", "INFO"),
                    "created": created_timestamp,
                    "window_start": incident.get("time_window", {}).get("start", ""),
                    "window_end": incident.get("time_window", {}).get("end", ""),
                    "root_candidate": incident.get("root_candidate_alert", ""),
                    "size": incident.get("cluster_size", 0)
                })

                # 2. Map Alerts
                # In a real system, we'd have full alert metadata passed here or fetched.
                # For this implementation, we just link the IDs we have.
                member_alerts = incident.get("member_alerts", [])
                for alert_id in member_alerts:
                    session.run("""
                        MERGE (a:Alert {id: $alert_id})
                        SET a.last_seen = $timestamp
                        WITH a
                        MATCH (i:Incident {id: $incident_id})
                        MERGE (i)-[r:CONTAINS {timestamp: $timestamp}]->(a)
                    """, {
                        "alert_id": alert_id,
                        "incident_id": incident_id,
                        "timestamp": created_timestamp
                    })

                # 3. Map Services and Hosts
                # Note: Schema is extensible. This logic can be expanded to APIs, Containers, etc.
                affected_services = incident.get("affected_services", [])
                for svc in affected_services:
                    if svc:
                        session.run("""
                            MERGE (s:Service {name: $svc})
                            SET s.last_impacted = $timestamp
                            WITH s
                            MATCH (i:Incident {id: $incident_id})
                            MERGE (i)-[r:IMPACTS {timestamp: $timestamp}]->(s)
                        """, {
                            "svc": svc,
                            "incident_id": incident_id,
                            "timestamp": created_timestamp
                        })

                affected_hosts = incident.get("affected_hosts", [])
                for host in affected_hosts:
                    if host:
                        session.run("""
                            MERGE (h:Host {name: $host})
                            SET h.last_impacted = $timestamp
                            WITH h
                            MATCH (i:Incident {id: $incident_id})
                            MERGE (i)-[r:IMPACTS {timestamp: $timestamp}]->(h)
                        """, {
                            "host": host,
                            "incident_id": incident_id,
                            "timestamp": created_timestamp
                        })
                        
                # Optional: Connect services to hosts if they co-occur in this incident
                if affected_services and affected_hosts:
                    for svc in affected_services:
                        for host in affected_hosts:
                            if svc and host:
                                session.run("""
                                    MATCH (s:Service {name: $svc})
                                    MATCH (h:Host {name: $host})
                                    MERGE (s)-[r:RUNS_ON]->(h)
                                    SET r.last_observed = $timestamp
                                """, {
                                    "svc": svc,
                                    "host": host,
                                    "timestamp": created_timestamp
                                })

                logger.info("incident_ingested_to_graph", incident_id=incident_id)
            except Exception as e:
                logger.error("graph_ingestion_failed", incident_id=incident_id, error=str(e))

graph_builder = GraphBuilder()
