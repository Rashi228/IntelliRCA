import structlog
from services.knowledge_graph.graph_query import graph_query
# from services.semantic.qdrant_store import qdrant_store # In production, this would query the API or DB directly.
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
            
            if not subgraph.get("nodes"):
                import time
                time.sleep(1.0) # Give kg_worker a moment to commit Neo4j transaction
                subgraph = graph_query.get_incident_subgraph(incident_id, depth=2)

            # if not subgraph.get("nodes"):
            #     # Presentation Auto-Seeder: Guarantee SRE graph visualization during fast live demos
            #     subgraph = {
            #         "nodes": {
            #             f"Incident-{incident_id}": {"type": "Incident", "label": f"Incident {incident_id}"},
            #             "Alert-DB-Crash": {"type": "Alert", "label": "DatabaseConnectionLost"},
            #             "Alert-API-Spike": {"type": "Alert", "label": "APITimeoutSpike"},
            #             "Service-user-login-api": {"type": "Service", "label": "user-login-api"},
            #             "Host-postgres-primary": {"type": "Host", "label": "postgres-primary-01"},
            #             "Host-api-server-01": {"type": "Host", "label": "api-server-01"}
            #         },
            #         "edges": [
            #             {"source": f"Incident-{incident_id}", "target": "Alert-DB-Crash", "relationship": "CONTAINS"},
            #             {"source": f"Incident-{incident_id}", "target": "Alert-API-Spike", "relationship": "CONTAINS"},
            #             {"source": f"Alert-DB-Crash", "target": "Host-postgres-primary", "relationship": "FIRED_ON"},
            #             {"source": f"Alert-API-Spike", "target": "Host-api-server-01", "relationship": "FIRED_ON"},
            #             {"source": f"Incident-{incident_id}", "target": "Service-user-login-api", "relationship": "IMPACTS"},
            #             {"source": "Service-user-login-api", "target": "Host-postgres-primary", "relationship": "DEPENDS_ON"}
            #         ]
            #     }
        except Exception as e:
            logger.error("evidence_builder_kg_failed", error=str(e))
            subgraph = {"nodes": {}, "edges": []}

        # 2. Historical Context (Semantic Search)
        # Mocking semantic retrieval here for the architecture skeleton.
        # It would query Qdrant using the root_candidate_alert description.
        historical_incidents = [
            {"id": "INC-7482", "title": "Postgres CPU Exhaustion", "resolution": "Scaled up database instances and optimized the failing query."}
        ]
        
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
