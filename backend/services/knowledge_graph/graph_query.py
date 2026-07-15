from neo4j import GraphDatabase
import structlog
from app.config import settings

logger = structlog.get_logger()

class GraphQueryService:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )

    def close(self):
        self.driver.close()

    def get_incident_subgraph(self, incident_id: str, depth: int = 2) -> dict:
        """
        Retrieves a local subgraph surrounding an Incident.
        Returns a dictionary of nodes and edges formatted for easy parsing by an LLM or NetworkX.
        """
        with self.driver.session() as session:
            try:
                # Dynamically traverse paths up to `depth` edges away from the Incident
                query = f"""
                    MATCH path = (i:Incident {{id: $incident_id}})-[*1..{depth}]-(connected)
                    RETURN path
                """
                result = session.run(query, {"incident_id": incident_id})
                
                nodes = {}
                edges = []
                
                for record in result:
                    path = record["path"]
                    
                    # Extract nodes
                    for node in path.nodes:
                        node_id = str(node.id)
                        if node_id not in nodes:
                            nodes[node_id] = {
                                "labels": list(node.labels),
                                "properties": dict(node.items())
                            }
                            
                    # Extract relationships
                    for rel in path.relationships:
                        edges.append({
                            "type": rel.type,
                            "source": str(rel.start_node.id),
                            "target": str(rel.end_node.id),
                            "properties": dict(rel.items())
                        })
                
                # Remove duplicate edges
                unique_edges = [dict(t) for t in {tuple(d.items()) for d in edges}]

                logger.info("subgraph_retrieved", incident_id=incident_id, nodes_count=len(nodes), edges_count=len(unique_edges))
                return {
                    "nodes": nodes,
                    "edges": unique_edges
                }
            except Exception as e:
                logger.error("subgraph_query_failed", incident_id=incident_id, error=str(e))
                return {"nodes": {}, "edges": []}

graph_query = GraphQueryService()
