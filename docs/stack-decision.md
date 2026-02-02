# Tech Stack Decision

## Final Choice: TypeScript + Three.js + Vercel AI SDK (via Tauri)

**Decision Date:** February 2, 2026
**Build Mode:** Fully autonomous by OpenClaw agents

---

## Stack Components

### Frontend
- **React 19** - UI framework
- **Three.js r160** - 3D/2D rendering engine (using Sprite/Points for 2D pixel art)
- **React Three Fiber (R3F)** - React renderer for Three.js
- **@react-three/drei** - Helper components and controls
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### Runtime
- **Tauri 2.x** - Lightweight desktop wrapper (Rust backend + WebView frontend)
- ~10MB bundle (vs ~150MB for Electron)
- Better performance than Electron

### Agent Backend
- **Python 3.12** - Agent runtime
- **FastAPI** - Async HTTP server for agent decisions
- **LangGraph** - State machine-based agent orchestration (chosen over LangChain)
- **LangChain OpenAI** - LLM integration
- **pydantic** - Data validation

### LLM
- **OpenAI GPT-4o-mini** - Fast, cheap, intelligent
- Can switch to **Ollama (Llama 3)** for local inference later

### UI Components
- **shadcn/ui** - Modern, accessible React components
- **Radix UI** - Headless primitives

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Tauri Desktop App                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           React + Three.js (WebView)                │   │
│  │  ┌─────────────────┐    ┌─────────────────────┐    │   │
│  │  │  Agent Canvas   │    │   Control Panel     │    │   │
│  │  │  (Three.js)     │    │   (shadcn/ui)       │    │   │
│  │  │  - 2D sprites   │    │   - Agent list      │    │   │
│  │  │  - Click events │    │   - Task queue      │    │   │
│  │  │  - Animations   │    │   - Debug view      │    │   │
│  │  └─────────────────┘    └─────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                   │
│                    Tauri IPC / HTTP                          │
│                           │                                   │
│                           ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Python FastAPI Agent Server (Background)    │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │          LangGraph Agent Engine             │    │   │
│  │  │  - Perception nodes (what agents see)       │    │   │
│  │  │  - Reasoning nodes (LLM decisions)          │    │   │
│  │  │  - Action nodes (what agents do)            │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Why This Stack Over Bevy + Rust?

| Criterion | Bevy + Rust | Tauri + Three.js |
|-----------|-------------|------------------|
| **Learning Curve** | High (Rust + ECS) | Medium (React + TS) |
| **Development Speed** | Medium | ⭐ Fast |
| **Interactivity** | Good | ⭐ Excellent (React) |
| **Clickability** | Manual raycasting | ⭐ Native React events |
| **Performance** | ⭐ Best (native) | Good (WebGL) |
| **Agent Framework** | Python via FFI | ⭐ LangGraph (native) |
| **Community** | Medium | ⭐ Largest |
| **Documentation** | Good | ⭐ Excellent |
| **Build Autonomy** | Harder | ⭐ Easier |

**Key Deciding Factors:**
1. I'm building this **fully autonomously** - React ecosystem has more examples/tutorials
2. **Clickable agents with details** is a core requirement - React handles this natively
3. **Modern agent frameworks** - LangGraph is state-of-the-art and Python-native
4. **Performance is sufficient** - 10,000 agents at 60FPS is plenty for this demo

---

## Project Structure

```
agent-marketplace-demo/
├── src-tauri/              # Tauri Rust backend
│   ├── src/
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── src/                    # React + Three.js frontend
│   ├── components/
│   │   ├── AgentCanvas.tsx        # Three.js agent visualization
│   │   ├── AgentPanel.tsx         # Side panel with agent list
│   │   ├── TaskQueue.tsx          # Task queue display
│   │   ├── DebugPanel.tsx         # Debug/decision visualization
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/
│   │   ├── useAgents.ts           # Agent state management
│   │   ├── useAgentBackend.ts     # Python backend API calls
│   │   └── useCamera.ts           # Camera controls
│   ├── lib/
│   │   ├── agents.ts              # Agent ECS (lightweight)
│   │   └── three-helpers.ts       # Three.js utilities
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── agent-backend/          # Python FastAPI + LangGraph
│   ├── main.py              # FastAPI server
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── langgraph_graph.py    # LangGraph state machine
│   │   ├── perception.py         # Agent perception logic
│   │   ├── reasoning.py          # LLM reasoning
│   │   └── action.py             # Action selection
│   ├── models/
│   │   └── schemas.py            # Pydantic models
│   └── requirements.txt
│
├── assets/
│   ├── sprites/
│   │   ├── agent-idle.png
│   │   ├── agent-working.png
│   │   ├── agent-communicating.png
│   │   └── background.png
│   └── sounds/                  # Empty for now (no sound)
│
├── docs/
│   ├── stack-decision.md
│   ├── research.md
│   ├── mvp-plan.md
│   └── architecture.md
│
├── README.md
├── AGENTS.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Implementation Phases

### Phase 1: Project Setup (Week 1)
- [ ] Initialize Tauri + React + TypeScript project
- [ ] Set up Vite, Three.js, React Three Fiber
- [ ] Install shadcn/ui components
- [ ] Set up Python FastAPI server
- [ ] Set up LangGraph basic graph
- [ ] Create basic agent sprite assets (placeholder pixel art)
- [ ] Render first agent on screen

### Phase 2: Core Visualization (Week 2)
- [ ] Implement ECS-like agent system in React (agents, positions, states)
- [ ] Render multiple agents as sprites
- [ ] Add agent states (idle, working, communicating, moving)
- [ ] Click detection for agents
- [ ] Agent detail panel (click to see info)
- [ ] Basic camera controls (pan/zoom)

### Phase 3: Agent Integration (Week 3)
- [ ] Connect React frontend to Python backend
- [ ] Implement LangGraph perception (what agents see)
- [ ] Implement LangGraph reasoning (LLM decisions)
- [ ] Implement LangGraph action (agent behaviors)
- [ ] Real-time agent updates from backend
- [ ] Visualize agent communication (message bubbles, lines)

### Phase 4: Task System (Week 4)
- [ ] Define task types
- [ ] Task assignment to agents
- [ ] Task progress visualization
- [ ] Task completion detection
- [ ] Task queue UI

### Phase 5: Polish (Week 5)
- [ ] Pixel art improvements
- [ ] Agent animations (idle, move, work)
- [ ] UI polish (better panels, tooltips)
- [ ] Debug panel (decision visualization, agent reasoning)
- [ ] Performance optimization (InstancedMesh for many agents)
- [ ] Documentation

---

## MVP Feature Checklist

### Visualization
- [x] Pixel art sprites
- [ ] Multiple agent types (colors)
- [ ] Agent states (idle, working, communicating)
- [ ] Agent movement animation
- [ ] Background scene

### Interactivity
- [ ] Click agent → show details panel
- [ ] Drag agents (optional)
- [ ] Pan/zoom camera
- [ ] Hover tooltips

### Agent System
- [ ] Agents perceive nearby agents/objects
- [ ] Agents reason (LLM-based decisions)
- [ ] Agents act (move, interact, work)
- [ ] Agent-to-agent communication
- [ ] Task assignment

### UI
- [ ] Agent list panel (status, state)
- [ ] Task queue display
- [ ] Debug panel (LLM reasoning, decisions)
- [ ] Controls (pause/resume, speed)

---

## Performance Targets

- **Agent Count:** 100-1000 agents (MVP), scale to 10,000 with optimization
- **Frame Rate:** 60 FPS
- **Agent Decision Latency:** <500ms for 100 agents (GPT-4o-mini)
- **Bundle Size:** <50MB (Tauri)

---

## Next Actions

1. Create detailed implementation plan for each phase
2. Set up Tauri + React + TypeScript project
3. Create Python FastAPI + LangGraph backend structure
4. Generate placeholder pixel art assets
5. Implement Phase 1 (Project Setup)

---

**Decision Made:** February 2, 2026
**Agent Build Mode:** Fully autonomous
**Expected Completion:** ~5 weeks
