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
        except Exception as e:
            logger.error("evidence_builder_kg_failed", error=str(e))
            subgraph = {"nodes": {}, "edges": []}

        # 2. Historical Context (Semantic Search)
        # Mocking semantic retrieval here for the architecture skeleton.
        # It would query Qdrant using the root_candidate_alert description.
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
