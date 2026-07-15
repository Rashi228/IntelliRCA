import json
import uuid
import structlog
import datetime
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct
from neo4j import GraphDatabase
from app.config import settings
from services.semantic.embedding_engine import embedding_engine

logger = structlog.get_logger()

class MemoryBuilder:
    def __init__(self):
        self.qdrant = QdrantClient(url=settings.QDRANT_URL)
        self.neo4j_driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
        self.collection_name = "memory_embeddings"
        self.embedding_engine = embedding_engine

    def close(self):
        self.neo4j_driver.close()

    def process_resolved_incident(self, rca_report: dict) -> str:
        """
        Takes a resolved RCA report, converts it to a vector memory, 
        stores it in Qdrant, and links it in Neo4j.
        Supports versioning. If the memory already exists, bumps version.
        """
        incident_id = rca_report.get("incident_id")
        if not incident_id:
            raise ValueError("rca_report must contain incident_id")

        logger.info("processing_memory_creation", incident_id=incident_id)

        # 1. Check if memory already exists to determine versioning
        existing_memory = self._get_existing_memory(incident_id)
        if existing_memory:
            memory_version = existing_memory.get("memory_version", 1) + 1
            memory_id = existing_memory.get("memory_id")
            logger.info("memory_version_bump", incident_id=incident_id, new_version=memory_version)
        else:
            memory_version = 1
            memory_id = f"MEM-{str(uuid.uuid4())[:8].upper()}"
            
        timestamp = datetime.datetime.utcnow().isoformat() + "Z"

        # 2. Compile Rich Text for Embedding
        # The embedding must capture the "experience" of the incident.
        rich_text = (
            f"Incident: {incident_id}. "
            f"Root Cause: {rca_report.get('root_cause')}. "
            f"Remediation: {rca_report.get('recommended_remediation')}. "
            f"Impacted Services: {', '.join(rca_report.get('affected_services', []))}. "
            f"Business Impact: {rca_report.get('business_impact')}. "
            f"Confidence: {rca_report.get('confidence_score')}."
        )

        vector = self.embedding_engine.generate_embedding(rich_text)
        
        # 3. Store in Qdrant with rich metadata
        payload = {
            "memory_id": memory_id,
            "incident_id": incident_id,
            "memory_version": memory_version,
            "timestamp": timestamp,
            "root_cause": rca_report.get("root_cause"),
            "recommended_remediation": rca_report.get("recommended_remediation"),
            "affected_services": rca_report.get("affected_services", []),
            "severity": rca_report.get("severity", "UNKNOWN"),
            "environment": rca_report.get("environment", "production"),
            "embedding_model_version": self.embedding_engine.model_name
        }

        self.qdrant.upsert(
            collection_name=self.collection_name,
            points=[
                PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_DNS, memory_id)),
                    vector=vector,
                    payload=payload
                )
            ]
        )

        # 4. Link in Neo4j
        self._update_neo4j_graph(memory_id, incident_id, memory_version, timestamp, payload)
        
        return memory_id

    def _get_existing_memory(self, incident_id: str) -> dict:
        """Query Neo4j to see if a memory already exists for this incident."""
        with self.neo4j_driver.session() as session:
            result = session.run("""
                MATCH (i:Incident {id: $incident_id})-[:GENERATED_MEMORY]->(m:Memory)
                RETURN m.id AS memory_id, m.version AS memory_version
                ORDER BY m.version DESC LIMIT 1
            """, {"incident_id": incident_id})
            record = result.single()
            if record:
                return {"memory_id": record["memory_id"], "memory_version": record["memory_version"]}
        return None

    def _update_neo4j_graph(self, memory_id: str, incident_id: str, version: int, timestamp: str, payload: dict):
        with self.neo4j_driver.session() as session:
            try:
                session.run("""
                    MATCH (i:Incident {id: $incident_id})
                    SET i.processing_status = 'Resolved'
                    
                    MERGE (m:Memory {id: $memory_id})
                    SET m.version = $version,
                        m.timestamp = $timestamp,
                        m.root_cause = $root_cause,
                        m.remediation = $remediation
                        
                    MERGE (i)-[r:GENERATED_MEMORY {timestamp: $timestamp}]->(m)
                """, {
                    "incident_id": incident_id,
                    "memory_id": memory_id,
                    "version": version,
                    "timestamp": timestamp,
                    "root_cause": payload.get("root_cause"),
                    "remediation": payload.get("recommended_remediation")
                })
                
                # Optional: Connect Memory to the Services it recommends fixes for
                services = payload.get("affected_services", [])
                for svc in services:
                    session.run("""
                        MATCH (m:Memory {id: $memory_id})
                        MERGE (s:Service {name: $svc})
                        MERGE (m)-[r:RECOMMENDS_FIX_FOR {timestamp: $timestamp}]->(s)
                    """, {
                        "memory_id": memory_id,
                        "svc": svc,
                        "timestamp": timestamp
                    })
                
                logger.info("memory_linked_in_graph", memory_id=memory_id, version=version)
            except Exception as e:
                logger.error("neo4j_memory_link_failed", error=str(e))

memory_builder = MemoryBuilder()
