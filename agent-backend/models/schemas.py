from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class AgentStateEnum(str, Enum):
    idle = "idle"
    working = "working"
    communicating = "communicating"
    moving = "moving"
    error = "error"

class Agent(BaseModel):
    id: int
    position: List[float]
    state: AgentStateEnum
    reasoning: Optional[str] = None
    task_id: Optional[str] = None

class AgentCreate(BaseModel):
    id: int
    position: List[float]
    state: AgentStateEnum = AgentStateEnum.idle

class TaskStatusEnum(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    failed = "failed"

class Task(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: TaskStatusEnum = TaskStatusEnum.pending
    assigned_agent_id: Optional[int] = None
    priority: int = 0

class TaskCreate(BaseModel):
    name: str
    description: Optional[str] = None
    priority: int = 0

class WorldState(BaseModel):
    agents: List[Agent]
    tasks: List[Task]
    timestamp: float
