import structlog
from langchain_core.messages import HumanMessage, SystemMessage
from services.rca_agent.state import GraphState
from services.rca_agent.llm_adapter import llm_adapter

logger = structlog.get_logger()
llm = llm_adapter.get_llm()

def coordinator_agent(state: GraphState):
    logger.info("agent_executing", agent="coordinator")
    return {"timeline": f"Incident started at {state['raw_incident_data'].get('time_window', {}).get('start', 'Unknown')}"}

def graph_agent(state: GraphState):
    logger.info("agent_executing", agent="graph")
    kg = state["evidence"]["kg_subgraph"]
    nodes = list(kg.get("nodes", {}).keys())
    return {"supporting_graph_nodes": nodes, "blast_radius": f"Graph radius extends to {len(nodes)} nodes."}

def memory_agent(state: GraphState):
    logger.info("agent_executing", agent="memory")
    # Simulate retrieving similar historical incidents from Qdrant
    historical = state["evidence"].get("historical_incidents", [])
    if historical:
        reasoning = f"Found {len(historical)} similar past incidents. Pattern suggests recurrent issue."
    else:
        reasoning = "No similar historical incidents found in Memory Graph."
    return {"timeline": f"{state.get('timeline', '')}\n[Memory Agent]: {reasoning}"}

def topology_agent(state: GraphState):
    logger.info("agent_executing", agent="topology")
    return {"affected_services": state["raw_incident_data"].get("affected_services", [])}

def business_impact_agent(state: GraphState):
    logger.info("agent_executing", agent="business_impact")
    context = state["evidence"].get("business_context", "Unknown")
    
    # Calculate blast radius based on topology context
    affected = state.get("affected_services", [])
    if len(affected) > 0:
        impact = f"High Impact: {len(affected)} services degraded. Context: {context}"
    else:
        impact = f"Low Impact: Isolated incident. Context: {context}"
        
    return {"business_impact": impact}

def rca_agent(state: GraphState):
    logger.info("agent_executing", agent="rca")
    # Actually call the LLM for root cause
    prompt = f"Analyze this incident: {state['raw_incident_data']}\nEvidence: {state['evidence']}"
    messages = [
        SystemMessage(content="You are an expert DevOps RCA Agent. Determine the root cause of the incident."),
        HumanMessage(content=prompt)
    ]
    try:
        response = llm.invoke(messages)
        rca = response.content
    except Exception as e:
        logger.error("llm_call_failed", error=str(e))
        rca = "LLM Generation Failed."
    
    return {"root_cause_analysis": rca, "confidence_score": 0.85}

def remediation_agent(state: GraphState):
    logger.info("agent_executing", agent="remediation")
    return {"recommended_remediation": "Restart affected services and check database connection pools."}

def consensus_validator(state: GraphState):
    logger.info("agent_executing", agent="consensus_validator")
    
    # Compile the final structured JSON
    final_report = {
        "incident_id": state["incident_id"],
        "root_cause": state.get("root_cause_analysis", ""),
        "confidence_score": state.get("confidence_score", 0.0),
        "blast_radius": state.get("blast_radius", ""),
        "affected_services": state.get("affected_services", []),
        "business_impact": state.get("business_impact", ""),
        "recommended_remediation": state.get("recommended_remediation", ""),
        "supporting_nodes": state.get("supporting_graph_nodes", []),
        "timeline": state.get("timeline", "")
    }
    
    return {"final_rca_report": final_report}
