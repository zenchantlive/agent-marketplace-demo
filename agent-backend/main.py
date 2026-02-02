from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import httpx

# Import the LangGraph agent engine
from agents.engine import AgentState, run_agent_cycle

# Import OpenClaw integration
from integrations.openclaw import (
    OpenClawGatewayClient,
    get_integration,
    shutdown_integration,
    OpenClawAgentState
)

app = FastAPI(
    title="Agent Marketplace Backend",
    description="FastAPI backend for multi-agent system visualization with LangGraph integration",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class AgentStateModel(BaseModel):
    id: int
    position: List[float]
    state: str
    reasoning: Optional[str] = None
    nearby_agents: List[int] = []

class AgentDecisionRequest(BaseModel):
    agent_id: int
    position: List[float]
    nearby_agents: List[int] = []

class AgentDecisionResponse(BaseModel):
    agent_id: int
    action: str
    reasoning: str
    observations: List[str]

class TaskCreateRequest(BaseModel):
    task_type: str
    description: str
    priority: int = 1

class TaskResponse(BaseModel):
    task_id: str
    status: str
    task: dict

# In-memory agent store (for demo)
agents_db = {
    1: {"id": 1, "position": [-2, 0], "state": "idle", "nearby_agents": [2, 3]},
    2: {"id": 2, "position": [0, 0], "state": "working", "nearby_agents": [1, 3]},
    3: {"id": 3, "position": [2, 0], "state": "communicating", "nearby_agents": [1, 2]},
}

# Task store
tasks_db = {}

@app.get("/")
async def root():
    return {
        "message": "Agent Marketplace Backend", 
        "status": "healthy",
        "version": "0.1.0",
        "langgraph": "enabled"
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy", "langgraph": "enabled"}

@app.get("/api/agents", response_model=List[AgentStateModel])
async def list_agents():
    """Get all agents and their states"""
    return [
        AgentStateModel(
            id=agent_id,
            position=agent["position"],
            state=agent["state"],
            nearby_agents=agent.get("nearby_agents", [])
        )
        for agent_id, agent in agents_db.items()
    ]

@app.get("/api/agents/{agent_id}", response_model=AgentStateModel)
async def get_agent(agent_id: int):
    """Get a specific agent's state"""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = agents_db[agent_id]
    return AgentStateModel(
        id=agent_id,
        position=agent["position"],
        state=agent["state"],
        nearby_agents=agent.get("nearby_agents", [])
    )

@app.post("/api/agents/decide", response_model=AgentDecisionResponse)
async def decide_agent_action(request: AgentDecisionRequest):
    """
    Get the next action for an agent using LangGraph.
    
    This endpoint uses the LangGraph state machine to determine
    the agent's next action based on its current state and environment.
    """
    # Create the agent state for LangGraph
    agent_state = AgentState(
        agent_id=request.agent_id,
        position=request.position,
        observations=[],
        reasoning="Initial state",
        action="idle",
        nearby_agents=request.nearby_agents
    )
    
    # Run the agent decision cycle through LangGraph
    result = run_agent_cycle(agent_state)
    
    return AgentDecisionResponse(
        agent_id=result["agent_id"],
        action=result["action"],
        reasoning=result["reasoning"],
        observations=result["observations"]
    )

@app.post("/api/tasks", response_model=TaskResponse)
async def create_task(task_data: TaskCreateRequest):
    """Create a new task for agents to complete"""
    task_id = str(uuid.uuid4())[:8]
    task_dict = {
        "task_id": task_id,
        "task_type": task_data.task_type,
        "description": task_data.description,
        "priority": task_data.priority,
        "status": "created",
        "created_at": str(uuid.uuid4())  # Placeholder for timestamp
    }
    
    tasks_db[task_id] = task_dict
    
    return TaskResponse(
        task_id=task_id,
        status="created",
        task=task_dict
    )

@app.get("/api/tasks")
async def list_tasks():
    """List all tasks"""
    return list(tasks_db.values())

@app.get("/api/tasks/{task_id}")
async def get_task(task_id: str):
    """Get a specific task"""
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks_db[task_id]


# ============================================================
# OpenClaw Integration Endpoints
# ============================================================

class OpenClawConfig(BaseModel):
    """Configuration for OpenClaw Gateway connection"""
    gateway_url: str = "http://localhost:18789"
    poll_interval: float = 5.0


class OpenClawAgentModel(BaseModel):
    """Agent data from OpenClaw in visualization format"""
    id: int
    position: List[float]
    state: str
    nearby_agents: List[int] = []
    reasoning: Optional[str] = None
    name: Optional[str] = None
    model: Optional[str] = None
    channel: Optional[str] = None


class OpenClawStatusResponse(BaseModel):
    """Status of OpenClaw integration"""
    connected: bool
    gateway_url: str
    agent_count: int


# Store OpenClaw integration instance
_openclaw_integration = None


@app.post("/api/openclaw/connect")
async def connect_openclaw(config: OpenClawConfig):
    """
    Connect to OpenClaw Gateway for agent data integration.
    
    This endpoint establishes a connection to the OpenClaw Gateway
    and begins polling for agent states.
    """
    global _openclaw_integration
    
    try:
        # Create and start integration
        _openclaw_integration = await get_integration(
            gateway_url=config.gateway_url,
            poll_interval=config.poll_interval
        )
        
        return {
            "status": "connected",
            "gateway_url": config.gateway_url,
            "message": "Successfully connected to OpenClaw Gateway"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect to OpenClaw Gateway: {str(e)}"
        )


@app.post("/api/openclaw/disconnect")
async def disconnect_openclaw():
    """
    Disconnect from OpenClaw Gateway.
    
    Stops polling and closes the connection.
    """
    global _openclaw_integration
    
    await shutdown_integration()
    _openclaw_integration = None
    
    return {
        "status": "disconnected",
        "message": "Disconnected from OpenClaw Gateway"
    }


@app.get("/api/openclaw/status", response_model=OpenClawStatusResponse)
async def get_openclaw_status():
    """
    Get the current status of OpenClaw integration.
    """
    global _openclaw_integration
    
    connected = _openclaw_integration is not None and _openclaw_integration.client.is_connected
    
    agent_count = 0
    if connected and _openclaw_integration:
        try:
            agents = await _openclaw_integration.client.get_active_agents()
            agent_count = len(agents)
        except Exception:
            agent_count = 0
    
    return OpenClawStatusResponse(
        connected=connected,
        gateway_url=_openclaw_integration.client.gateway_url if _openclaw_integration else "",
        agent_count=agent_count
    )


@app.get("/api/openclaw/agents", response_model=List[OpenClawAgentModel])
async def get_openclaw_agents():
    """
    Get agents from OpenClaw Gateway in visualization format.
    
    Returns a list of agents with their current state, position,
    and other information suitable for the visualization.
    """
    global _openclaw_integration
    
    if not _openclaw_integration or not _openclaw_integration.client.is_connected:
        raise HTTPException(
            status_code=503,
            detail="OpenClaw Gateway not connected. Call /api/openclaw/connect first."
        )
    
    try:
        agents = await _openclaw_integration.get_agents_for_visualization()
        return agents
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch agents: {str(e)}"
        )


@app.get("/api/openclaw/sessions")
async def get_openclaw_sessions():
    """
    Get active sessions from OpenClaw Gateway.
    
    Returns session information including agent counts and states.
    """
    global _openclaw_integration
    
    if not _openclaw_integration or not _openclaw_integration.client.is_connected:
        raise HTTPException(
            status_code=503,
            detail="OpenClaw Gateway not connected. Call /api/openclaw/connect first."
        )
    
    try:
        sessions = await _openclaw_integration.client.get_sessions()
        return [
            {
                "id": s.id,
                "key": s.key,
                "kind": s.kind,
                "model": s.model,
                "agent_count": len(s.agents),
                "updated_at": s.updated_at
            }
            for s in sessions
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch sessions: {str(e)}"
        )


@app.post("/api/openclaw/sync-demo")
async def sync_demo_to_openclaw():
    """
    Sync local demo agents to OpenClaw Gateway.
    
    This is a utility endpoint to demonstrate how local agent
    states could be pushed to OpenClaw for integration.
    """
    global _openclaw_integration
    
    # For demo, just return success with instructions
    return {
        "message": "Demo agents are local. To sync with OpenClaw:",
        "instructions": [
            "1. Ensure OpenClaw Gateway is running on configured port",
            "2. Call POST /api/openclaw/connect to establish connection",
            "3. Agents will automatically be fetched from Gateway",
            "4. Use /api/openclaw/agents to get visualization data"
        ],
        "demo_agents": list(agents_db.values())
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
