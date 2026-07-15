from langgraph.graph import StateGraph, END
from services.rca_agent.state import GraphState
from services.rca_agent.agents import (
    coordinator_agent, graph_agent, memory_agent, topology_agent, 
    rca_agent, business_impact_agent, remediation_agent, consensus_validator
)

def create_rca_workflow():
    workflow = StateGraph(GraphState)
    
    # Add Nodes
    workflow.add_node("coordinator", coordinator_agent)
    workflow.add_node("graph_analyzer", graph_agent)
    workflow.add_node("memory_analyzer", memory_agent)
    workflow.add_node("topology_analyzer", topology_agent)
    workflow.add_node("business_impact", business_impact_agent)
    workflow.add_node("rca_generator", rca_agent)
    workflow.add_node("remediation", remediation_agent)
    workflow.add_node("consensus_validator", consensus_validator)
    
    # Define Edges (Sequential for now, can be parallelized in LangGraph later)
    workflow.set_entry_point("coordinator")
    workflow.add_edge("coordinator", "graph_analyzer")
    workflow.add_edge("graph_analyzer", "topology_analyzer")
    workflow.add_edge("topology_analyzer", "memory_analyzer")
    workflow.add_edge("memory_analyzer", "business_impact")
    workflow.add_edge("business_impact", "rca_generator")
    workflow.add_edge("rca_generator", "remediation")
    workflow.add_edge("remediation", "consensus_validator")
    workflow.add_edge("consensus_validator", END)
    
    return workflow.compile()

rca_workflow = create_rca_workflow()
