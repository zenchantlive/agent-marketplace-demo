# Tech Stack Decision (Revised: Web-First)

## Final Choice: Web-First (Vite + React + Three.js) with Tauri Option

**Decision Date:** February 2, 2026
**Build Mode:** Fully autonomous by OpenClaw agents
**Deployment:** Web (Vercel/Netlify) → Optional Tauri wrapper later

---

## Why Web-First?

| Criterion | Web-First | Tauri-First |
|-----------|-----------|-------------|
| **Time to Demo** | ⭐ Fastest (days) | Slower (weeks) |
| **Sharing** | ⭐ URL only | Download + install |
| **Iterating** | ⭐ Fast (hot reload) | Slower (rebuild) |
| **Deployment** | ⭐ One command | Multi-platform builds |
| **Performance** | Good (60 FPS) | ⭐ Best |
| **Offline** | Needs internet | ⭐ Works offline |
| **OS Access** | Limited | ⭐ Full native |

**For a demo, web-first wins.** We can wrap in Tauri later if needed.

---

## Stack Components

### Frontend (Web-First)
- **React 19** - UI framework
- **Three.js r160** - 3D/2D rendering
- **React Three Fiber (R3F)** - React renderer for Three.js
- **@react-three/drei** - Helper components
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server (super fast HMR)

### Agent Backend
- **Python FastAPI** - Async HTTP server
- **LangGraph** - Agent orchestration
- **LangChain OpenAI** - LLM integration
- **pydantic** - Data validation

### Deployment
- **Vercel** - Frontend hosting (automatic)
- **Render / Railway** - Python backend hosting
- **or local development only** (no deployment needed for demo)

### Optional: Tauri Wrapper (Later)
If we need standalone app later:
```bash
npm create tauri-app@latest
# Use existing web frontend as WebView
```

---

## Architecture (Web-First)

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (User)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         React + Three.js (Local)                    │   │
│  │  ┌─────────────────┐    ┌─────────────────────┐    │   │
│  │  │  Agent Canvas   │    │   Control Panel     │    │   │
│  │  │  (Three.js)     │    │   (shadcn/ui)       │    │   │
│  │  └─────────────────┘    └─────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                   │
│                    HTTP / WebSocket                          │
│                           │                                   │
│                           ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Python FastAPI Agent Server                 │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │          LangGraph Agent Engine             │    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Hosting:
- Frontend: Vercel (static build)
- Backend: Render / Railway / local (Python API)
```

---

## Project Structure (Web-First)

```
agent-marketplace-demo/
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
│   └── main.tsx
│
├── agent-backend/          # Python FastAPI + LangGraph
│   ├── main.py              # FastAPI server
│   ├── agents/
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
│   │   └── background.png
│   └── sounds/                  # Empty for now
│
├── docs/
│   ├── stack-decision.md
│   ├── tauri-best-practices.md   # Tauri reference (if needed later)
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

## Implementation Phases (Web-First)

### Phase 1: Web Setup (Week 1)
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install Three.js + React Three Fiber
- [ ] Set up shadcn/ui components
- [ ] Create basic agent sprite assets
- [ ] Render first agent on screen

### Phase 2: Core Visualization (Week 2)
- [ ] Implement agent system (agents, positions, states)
- [ ] Render multiple agents as sprites
- [ ] Add agent states (idle, working, communicating)
- [ ] Click detection for agents
- [ ] Agent detail panel
- [ ] Camera controls (pan/zoom)

### Phase 3: Agent Backend (Week 3)
- [ ] Set up Python FastAPI server
- [ ] Implement LangGraph perception
- [ ] Implement LangGraph reasoning (LLM)
- [ ] Implement LangGraph action
- [ ] Connect frontend to backend
- [ ] Visualize agent communication

### Phase 4: Task System (Week 4)
- [ ] Define task types
- [ ] Task assignment to agents
- [ ] Task progress visualization
- [ ] Task queue UI

### Phase 5: Polish & Deployment (Week 5)
- [ ] Pixel art improvements
- [ ] Agent animations
- [ ] UI polish
- [ ] Debug panel
- [ ] Performance optimization
- [ ] Deploy to Vercel (frontend)
- [ ] Deploy backend or run locally

### Phase 6 (Optional): Tauri Wrapper (Later)
- [ ] Wrap web app in Tauri
- [ ] Test native performance
- [ ] Create desktop builds

---

## Performance Targets (Web)

- **Agent Count:** 100-1000 agents (MVP), 10,000 with optimization
- **Frame Rate:** 60 FPS
- **Bundle Size:** <5MB (gzipped)
- **Agent Decision Latency:** <500ms for 100 agents

---

## Next Actions

1. Create Tauri best practices doc
2. Update project structure to web-first
3. Start Phase 1: Web Setup

---

**Decision Revised:** February 2, 2026
**Build Mode:** Web-first, Tauri optional
**Expected Completion:** ~5 weeks
