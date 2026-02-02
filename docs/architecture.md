# System Architecture

**Last Updated:** February 2, 2026
**Project:** Agent Marketplace Demo

---

## Overview

A web-based 2D pixel-art application that visualizes multi-agent collaboration in real-time. Built with React + Three.js for rendering, and Python FastAPI + LangGraph for agent orchestration.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User's Browser                         │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               React App (SPA)                        │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │         Agent Canvas (Three.js)            │    │   │
│  │  │  ┌──────────────────────────────────────┐  │    │   │
│  │  │  │  - Agent Sprites (2D)               │  │    │   │
│  │  │  │  - Click detection                  │  │    │   │
│  │  │  │  - Animations                       │  │    │   │
│  │  │  └──────────────────────────────────────┘  │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │         Control Panel (shadcn/ui)           │    │   │
│  │  │  ┌──────────────────────────────────────┐  │    │   │
│  │  │  │  - Agent List                       │  │    │   │
│  │  │  │  - Task Queue                      │  │    │   │
│  │  │  │  - Debug Panel                      │  │    │   │
│  │  │  └──────────────────────────────────────┘  │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                   │
│                    HTTP / WebSocket                          │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Python FastAPI Server                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API Layer (FastAPI)                   │   │
│  │  - /api/agents          - Get/list agents          │   │
│  │  - /api/agents/{id}/decide - Get agent decisions   │   │
│  │  - /api/tasks          - Task management           │   │
│  │  - /api/health         - Health check              │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                   │
│                           ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              LangGraph Engine                       │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  State Machine: perceive → reason → act    │    │   │
│  │  │                                             │    │   │
│  │  │  ┌──────────────────────────────────┐    │    │   │
│  │  │  │  Perception Node                 │    │    │   │
│  │  │  │  - Spatial queries (nearby)      │    │    │   │
│  │  │  │  - Object detection              │    │    │   │
│  │  │  └──────────────────────────────────┘    │    │   │
│  │  │                  │                         │    │   │
│  │  │                  ▼                         │    │   │
│  │  │  ┌──────────────────────────────────┐    │    │   │
│  │  │  │  Reasoning Node (LLM)            │    │    │   │
│  │  │  │  - GPT-4o-mini                  │    │    │   │
│  │  │  │  - Decision making               │    │    │   │
│  │  │  └──────────────────────────────────┘    │    │   │
│  │  │                  │                         │    │   │
│  │  │                  ▼                         │    │   │
│  │  │  ┌──────────────────────────────────┐    │    │   │
│  │  │  │  Action Node                     │    │    │   │
│  │  │  │  - Execute behaviors              │    │    │   │
│  │  │  │  - Update state                 │    │    │   │
│  │  │  └──────────────────────────────────┘    │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                   │
│                           ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              OpenAI API (or local LLM)             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Frontend (React + Three.js)

#### AgentCanvas Component
```typescript
interface AgentCanvasProps {
  agents: Agent[];
  onAgentClick: (agent: Agent) => void;
}

// Responsibilities:
// - Render agents as 2D sprites
// - Handle click detection
// - Animate agent movement
// - Draw communication lines
// - Handle camera (pan/zoom)
```

#### State Management
```typescript
// Lightweight ECS-like system
interface Agent {
  id: number;
  position: [number, number];
  state: AgentState;  // idle, working, communicating
  color: string;
  sprite: Sprite;
}

interface AgentState {
  type: 'idle' | 'working' | 'communicating' | 'moving';
  target?: [number, number];
  task?: Task;
}
```

#### Three.js Optimization
- **InstancedMesh:** Render 100+ identical sprites efficiently
- **Sprite batching:** Group similar sprites together
- **Frustum culling:** Automatic in Three.js
- **LOD (Level of Detail):** Simplify distant agents
- **Pixel-perfect:** `renderer.setPixelRatio(1, 1)`

### 2. Backend (Python FastAPI + LangGraph)

#### LangGraph State Machine

```python
from typing import TypedDict, List
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    agent_id: int
    position: tuple[float, float]
    observations: List[str]      # What agent sees
    reasoning: str                # LLM reasoning
    action: str                   # What agent does
    nearby_agents: List[int]      # IDs of nearby agents

# Graph: perceive → reason → act
graph = StateGraph(AgentState)
graph.add_node("perceive", perception_node)
graph.add_node("reason", reasoning_node)
graph.add_node("act", action_node)
graph.set_entry_point("perceive")
graph.add_edge("perceive", "reason")
graph.add_edge("reason", "act")
graph.add_edge("act", END)
```

#### API Endpoints

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class AgentDecisionRequest(BaseModel):
    agent_id: int
    position: tuple[float, float]
    nearby_agents: List[int]

@app.post("/api/agents/decide")
async def decide_agent_action(req: AgentDecisionRequest):
    """Get next action for an agent via LangGraph"""
    result = await agent_graph.invoke({
        "agent_id": req.agent_id,
        "position": req.position,
        "nearby_agents": req.nearby_agents,
    })
    return result

@app.get("/api/agents")
async def list_agents():
    """Get all agents and their states"""
    return agents_db.get_all()
```

---

## Data Flow

### 1. Agent Decision Flow

```
Frontend                          Backend (FastAPI + LangGraph)
   │                                    │
   │  POST /api/agents/decide            │
   │  { agent_id, position, nearby }     │
   │─────────────────────────────────────>│
   │                                    │
   │                                    │  Perception Node
   │                                    │  - Find nearby agents
   │                                    │  - Detect objects
   │                                    │  - Build observations
   │                                    │
   │                                    │  Reasoning Node (LLM)
   │                                    │  - GPT-4o-mini decides
   │                                    │  - Returns action + reasoning
   │                                    │
   │                                    │  Action Node
   │                                    │  - Execute behavior
   │                                    │  - Update state
   │                                    │
   │  { action, reasoning, state }       │
   │<─────────────────────────────────────│
   │                                    │
   │  Update agent sprite & state        │
   ▼                                    ▼
```

### 2. Real-time Updates Flow

```
Frontend                          Backend
   │                                    │
   │  WebSocket connect                  │
   │────────────────────────────────────>│
   │                                    │
   │  Periodic: get all agents           │
   │<────────────────────────────────────│
   │  Update UI                         │
   ▼                                    ▼
```

---

## Performance Considerations

### Frontend Performance

| Technique | Use Case | Improvement |
|-----------|----------|-------------|
| InstancedMesh | 100+ identical sprites | 10-50x faster |
| Sprite batching | Similar sprites grouped | 5-10x faster |
| LOD (Level of Detail) | Distant agents | 30-50% fewer draw calls |
| Object pooling | Temporary objects | No GC pauses |
| RequestAnimationFrame | Smooth animations | Sync with display |

### Backend Performance

| Technique | Use Case | Improvement |
|-----------|----------|-------------|
| Batch LLM calls | Multiple agents | 2-5x faster |
| Spatial indexing (KD-tree) | Nearby queries | O(log n) vs O(n) |
| Caching | Repeated queries | 100x+ faster |
| Async/await | Concurrent I/O | Non-blocking |

### Estimated Performance

- **100 agents:** 60 FPS, <100ms agent decisions
- **1,000 agents:** 60 FPS, <500ms agent decisions
- **10,000 agents:** 30-60 FPS, <2s agent decisions (with optimizations)

---

## Security

### Frontend
- Input validation (TypeScript + Zod)
- Sanitize user input
- Rate limiting (API calls)
- No secrets in frontend code

### Backend
- API key management (environment variables)
- Rate limiting per IP
- CORS configuration
- Input validation (Pydantic)
- SQL injection prevention (if using DB)

---

## Deployment

### Frontend Deployment Options

1. **Vercel** (Recommended)
   - Automatic deployments from git
   - Fast edge network
   - Easy preview URLs

2. **Netlify**
   - Similar to Vercel
   - Great free tier

3. **GitHub Pages**
   - Simple, free
   - Manual builds

### Backend Deployment Options

1. **Render** (Recommended)
   - Easy Python deployment
   - Free tier available

2. **Railway**
   - Modern platform
   - Good DX

3. **Local Development**
   - No deployment needed
   - Direct API calls to localhost

### Environment Variables

```bash
# Frontend (.env)
VITE_API_URL=http://localhost:8000  # or production URL

# Backend (.env)
OPENAI_API_KEY=sk-...
LOG_LEVEL=info
```

---

## Optional: Tauri Wrapper

If we need a standalone desktop app later:

```
agent-marketplace-demo/
├── src/ (React app - same as web)
├── src-tauri/ (Tauri Rust backend)
│   ├── src/commands.rs  (Optional native features)
│   └── tauri.conf.json
└── agent-backend/ (Python backend - same)
```

The React app remains unchanged. Tauri wraps it with a Rust backend.

See [Tauri Best Practices](tauri-best-practices.md) for details.

---

## Scaling

### Horizontal Scaling

- **Frontend:** CDN (Cloudflare, Vercel Edge)
- **Backend:** Load balancer → multiple FastAPI instances
- **LLM:** OpenAI API (scales automatically)

### Vertical Scaling

- **Frontend:** Better GPU for WebGL
- **Backend:** More CPU for LangGraph
- **LLM:** Faster models or quantized local LLMs

---

## Monitoring

### Frontend
- Browser DevTools (performance profiler)
- React DevTools (component profiling)
- Sentry (error tracking - optional)

### Backend
- FastAPI /metrics endpoint
- Structured logging (JSON)
- OpenTelemetry tracing (optional)

---

## Future Enhancements

### V2 Features
- [ ] WebSocket for real-time updates
- [ ] Local LLM integration (Ollama)
- [ ] Agent persistence (database)
- [ ] Task scheduling system
- [ ] Agent-to-agent messaging UI
- [ ] Save/load simulations

### V3 Features
- [ ] Tauri standalone wrapper
- [ ] Offline mode with local LLM
- [ ] Multi-scenario simulations
- [ ] Agent behavior analysis
- [ ] Recording/replay system

---

**Last Updated:** February 2, 2026
