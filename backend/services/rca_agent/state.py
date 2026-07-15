from typing import TypedDict, List, Dict, Any, Optional
import operator
from typing import Annotated

class Evidence(TypedDict):
    kg_subgraph: Dict[str, Any]
    historical_incidents: List[Dict[str, Any]]
    topology_context: str
    business_context: str

class VerificationResult(TypedDict):
    agent: str
    is_valid: bool
    feedback: str

class GraphState(TypedDict):
    # Inputs
    incident_id: str
    raw_incident_data: Dict[str, Any]
    
    # Evidence gathered before reasoning
    evidence: Evidence
    
    # Agent Outputs mapped to structured requirements
    root_cause_analysis: str
    confidence_score: float
    affected_services: List[str]
    blast_radius: str
    business_impact: str
    recommended_remediation: str
    timeline: str
    supporting_graph_nodes: List[str]
    
    # Validation
    verification_results: Annotated[List[VerificationResult], operator.add]
    
    # Final Output
    final_rca_report: Dict[str, Any]
