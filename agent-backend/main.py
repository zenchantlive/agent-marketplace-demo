from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid

app = FastAPI(
    title="Agent Marketplace Backend",
    description="FastAPI backend for multi-agent system visualization",
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
class AgentState(BaseModel):
    id: int
    position: List[float]
    state: str
    reasoning: Optional[str] = None

class AgentDecisionRequest(BaseModel):
    agent_id: int
    position: List[float]
    nearby_agents: List[int]

class AgentDecisionResponse(BaseModel):
    agent_id: int
    action: str
    reasoning: str

# In-memory agent store (for demo)
agents_db = {
    1: {"id": 1, "position": [-2, 0], "state": "idle"},
    2: {"id": 2, "position": [0, 0], "state": "working"},
    3: {"id": 3, "position": [2, 0], "state": "communicating"},
}

@app.get("/")
async def root():
    return {"message": "Agent Marketplace Backend", "status": "healthy"}

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/agents", response_model=List[AgentState])
async def list_agents():
    """Get all agents and their states"""
    return list(agents_db.values())

@app.get("/api/agents/{agent_id}", response_model=AgentState)
async def get_agent(agent_id: int):
    """Get a specific agent's state"""
    if agent_id not in agents_db:
        return {"error": "Agent not found"}
    return agents_db[agent_id]

@app.post("/api/agents/decide", response_model=AgentDecisionResponse)
async def decide_agent_action(request: AgentDecisionRequest):
    """
    Get the next action for an agent.
    
    This is a placeholder that simulates agent decision-making.
    In production, this would call the LangGraph agent engine.
    """
    # Simulate decision-making (placeholder for LangGraph integration)
    action = "idle"
    reasoning = "No nearby agents detected, maintaining idle state"
    
    # Simple simulation logic
    if request.nearby_agents:
        if len(request.nearby_agents) > 1:
            action = "communicating"
            reasoning = f"Detected {len(request.nearby_agents)} nearby agents, initiating communication"
        else:
            action = "working"
            reasoning = "Single nearby agent detected, beginning collaborative work"
    
    return AgentDecisionResponse(
        agent_id=request.agent_id,
        action=action,
        reasoning=reasoning
    )

@app.post("/api/tasks")
async def create_task(task_data: dict):
    """Create a new task for agents to complete"""
    task_id = str(uuid.uuid4())[:8]
    return {"task_id": task_id, "status": "created", "task": task_data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
