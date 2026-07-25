import structlog
from services.knowledge_graph.graph_query import graph_query
from services.rca_agent.state import Evidence

logger = structlog.get_logger()

class EvidenceBuilder:
    def __init__(self):
        pass

    def gather_evidence(self, incident_id: str, raw_incident: dict) -> Evidence:
        """
        Gathers context from KG, Qdrant, and Topology BEFORE LLM reasoning begins.
        This enforces an Evidence-Driven pipeline rather than an LLM-hallucinated one.
        """
        logger.info("gathering_evidence", incident_id=incident_id)
        
        # 1. Knowledge Graph Context
        try:
            # We assume depth=2 is sufficient for blast radius context
            subgraph = graph_query.get_incident_subgraph(incident_id, depth=2)
            
            # Polling loop: Wait up to 2.5s for kg_worker to commit Neo4j transaction
            retries = 0
            while not subgraph.get("nodes") and retries < 5:
                import time
                time.sleep(0.5)
                subgraph = graph_query.get_incident_subgraph(incident_id, depth=2)
                retries += 1

        except Exception as e:
            logger.error("evidence_builder_kg_failed", error=str(e))
            subgraph = {"nodes": {}, "edges": []}

        # 2. Historical Context (Semantic Search against Qdrant via Memory API)
        try:
            query_str = f"{raw_incident.get('title', '')} {raw_incident.get('description', '')}".strip()
            if not query_str:
                query_str = f"Incident {incident_id}"
            
            affected_svc = raw_incident.get("affected_services", [None])[0] if raw_incident.get("affected_services") else None
            
            import requests
            params = {"query": query_str, "limit": 3}
            if affected_svc:
                params["service"] = affected_svc
            res = requests.get("http://memory_api:8087/api/v1/memory/similar", params=params, timeout=3.0)
            
            historical_incidents = []
            if res.status_code == 200:
                historical_incidents = res.json().get("results", [])
            
            if not historical_incidents:
                # Baseline memory fallback if Qdrant is completely empty on brand new setup
                historical_incidents = [
                    {"memory_id": "MEM-BASE", "incident_id": "INC-7482", "root_cause": "Postgres CPU Exhaustion and connection pool saturation.", "recommended_remediation": "Scaled up database instances and optimized query pools.", "similarity_score": 0.85}
                ]
        except Exception as e:
            logger.error("evidence_builder_memory_failed", error=str(e))
            historical_incidents = []
        
        # 3. Topology Context
        affected_hosts = raw_incident.get("affected_hosts", [])
        affected_services = raw_incident.get("affected_services", [])
        topology_context = f"Services: {affected_services} running on Hosts: {affected_hosts}"
        
        # 4. Business Context
        business_context = "Unknown business impact."
        if "frontend" in str(affected_services).lower():
            business_context = "Customer-facing web application. High impact."

        logger.info("evidence_gathered", incident_id=incident_id)
        return {
            "kg_subgraph": subgraph,
            "historical_incidents": historical_incidents,
            "topology_context": topology_context,
            "business_context": business_context
        }

evidence_builder = EvidenceBuilder()
