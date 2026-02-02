"""
LangGraph Agent Engine for Multi-Agent System

This module implements the agent state machine with perceive, reason, and act nodes.
"""

from typing import TypedDict, List, Optional
from enum import Enum
from langgraph.graph import StateGraph, END


class AgentState(TypedDict):
    """State for a single agent in the system"""
    agent_id: int
    position: List[float]
    observations: List[str]
    reasoning: str
    action: str
    nearby_agents: List[int]


class AgentStatus(str, Enum):
    IDLE = "idle"
    WORKING = "working"
    COMMUNICATING = "communicating"
    THINKING = "thinking"


def perceive_node(state: AgentState) -> AgentState:
    """
    Perceive the environment and update observations.
    
    This node processes what the agent can "see" in its environment.
    """
    # Simple perception logic based on state
    if state["nearby_agents"]:
        observations = [
            f"Detected {len(state['nearby_agents'])} nearby agents",
            f"Current position: {state['position']}",
            f"Current state: {state['action']}"
        ]
    else:
        observations = [
            "No nearby agents detected",
            f"Current position: {state['position']}",
            "Environment appears quiet"
        ]
    
    return {
        **state,
        "observations": observations
    }


def reason_node(state: AgentState) -> AgentState:
    """
    Reason about the current situation and decide on next action.
    
    This node implements the agent's decision-making process.
    """
    nearby_count = len(state["nearby_agents"])
    current_action = state.get("action", "idle")
    
    # Simple reasoning logic
    if nearby_count == 0:
        reasoning = "No agents nearby, continue current activity"
        action = "idle"
    elif nearby_count == 1:
        reasoning = "Single agent nearby, could collaborate or communicate"
        action = "working"
    else:
        reasoning = f"Multiple agents ({nearby_count}) detected, initiate group communication"
        action = "communicating"
    
    return {
        **state,
        "reasoning": reasoning,
        "action": action
    }


def act_node(state: AgentState) -> AgentState:
    """
    Execute the decided action and update the environment.
    
    This node performs the actual action based on the reasoning.
    """
    # In a real system, this would update the agent's position or state
    # in the shared environment
    
    action = state["action"]
    
    # Simulate action execution
    if action == "communicating":
        # Agent would send message to nearby agents
        pass
    elif action == "working":
        # Agent would perform work on a task
        pass
    
    return state


def create_agent_graph() -> StateGraph:
    """
    Create the agent state machine graph.
    
    Returns a StateGraph with perceive -> reason -> act flow.
    """
    # Create the state graph
    graph = StateGraph(AgentState)
    
    # Add nodes
    graph.add_node("perceive", perceive_node)
    graph.add_node("reason", reason_node)
    graph.add_node("act", act_node)
    
    # Set up the flow
    graph.set_entry_point("perceive")
    graph.add_edge("perceive", "reason")
    graph.add_edge("reason", "act")
    graph.add_edge("act", END)
    
    return graph


def run_agent_cycle(initial_state: AgentState) -> AgentState:
    """
    Run a single agent decision cycle.
    
    Args:
        initial_state: The starting state for the agent
        
    Returns:
        The updated state after one cycle
    """
    # Create the graph
    graph = create_agent_graph()
    
    # Compile the graph (creates a runnable)
    app = graph.compile()
    
    # Run one cycle
    result = app.invoke(initial_state)
    
    return result


if __name__ == "__main__":
    # Test the agent
    test_state = {
        "agent_id": 1,
        "position": [0.0, 0.0],
        "observations": [],
        "reasoning": "",
        "action": "idle",
        "nearby_agents": [2, 3]
    }
    
    result = run_agent_cycle(test_state)
    print("Agent cycle completed:")
    print(f"  Action: {result['action']}")
    print(f"  Reasoning: {result['reasoning']}")
    print(f"  Observations: {result['observations']}")
