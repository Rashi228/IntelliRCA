import networkx as nx
import structlog
from typing import List, Dict

logger = structlog.get_logger()

class TopologyBuilder:
    def __init__(self):
        # In a real scenario, this would query Neo4j or an infrastructure API (e.g., K8s API) 
        # to build a live graph. For now, we build a local graph from alert metadata.
        pass
        
    def build_topology_graph(self, alerts: List[Dict]) -> nx.Graph:
        """
        Builds a localized topology graph based on alert metadata (host, service, namespace).
        """
        G = nx.Graph()
        
        for alert in alerts:
            alert_id = alert.get("id")
            metadata = alert.get("metadata", {})
            
            host = metadata.get("host")
            service = metadata.get("service")
            namespace = metadata.get("namespace")
            
            # Add alert node
            G.add_node(alert_id, type="alert")
            
            # Add infrastructure nodes and edges
            if host:
                host_node = f"host:{host}"
                G.add_node(host_node, type="host")
                G.add_edge(alert_id, host_node, weight=1.0)
                
            if service:
                svc_node = f"service:{service}"
                G.add_node(svc_node, type="service")
                G.add_edge(alert_id, svc_node, weight=1.0)
                
                # Assume services in the same namespace are loosely connected
                if namespace:
                    ns_node = f"ns:{namespace}"
                    G.add_node(ns_node, type="namespace")
                    G.add_edge(svc_node, ns_node, weight=0.5)
                    
        logger.info("topology_graph_built", nodes=G.number_of_nodes(), edges=G.number_of_edges())
        return G

    def get_topology_distance(self, G: nx.Graph, alert1_id: str, alert2_id: str) -> float:
        """
        Returns a distance score between 0.0 (identical/same node) and 1.0 (completely disconnected).
        Uses shortest path in the localized topology graph.
        """
        try:
            if not G.has_node(alert1_id) or not G.has_node(alert2_id):
                return 1.0
                
            if nx.has_path(G, alert1_id, alert2_id):
                path_length = nx.shortest_path_length(G, alert1_id, alert2_id, weight='weight')
                # Normalize path length (assuming max reasonable path length is around 4-5)
                distance = min(path_length / 5.0, 1.0)
                return distance
            else:
                return 1.0
        except Exception as e:
            logger.error("topology_distance_error", error=str(e))
            return 1.0

topology_builder = TopologyBuilder()
