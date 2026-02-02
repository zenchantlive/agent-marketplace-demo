# Tauri Best Practices & Developer Guide

> **Note:** This project is currently **web-first**. This document is a reference for if/when we decide to wrap the web app in Tauri for a standalone desktop application.

---

## What is Tauri?

Tauri is a lightweight desktop application framework that lets you build cross-platform apps using web technologies (HTML/CSS/JS/TS) as the frontend, with Rust as the backend.

### Key Characteristics

- **Lightweight:** ~10MB bundle (vs ~150MB for Electron)
- **Secure:** Sandboxed by default, explicit permissions
- **Fast:** Rust backend + native WebView
- **Cross-platform:** Windows, macOS, Linux, mobile (beta)
- **Modern:** React/Vue/Svelte support out-of-the-box

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Tauri Desktop App                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           WebView (Frontend)                       │   │
│  │  ┌─────────────────┐    ┌─────────────────────┐    │   │
│  │  │  React App      │    │   Three.js Canvas   │    │   │
│  │  │  (Same as web)  │    │   (Same as web)     │    │   │
│  │  └─────────────────┘    └─────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                   │
│                    Tauri IPC (Commands)                      │
│                           │                                   │
│                           ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Rust Backend (src-tauri/src/)             │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  Commands (exposed to frontend)              │    │   │
│  │  │  - file operations                          │    │   │
│  │  │  - system info                              │    │   │
│  │  │  - native APIs                             │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure (Tauri)

```
agent-marketplace-demo/
├── src/                     # React frontend (same as web)
├── src-tauri/               # Tauri Rust backend
│   ├── src/
│   │   ├── lib.rs          # Entry point
│   │   ├── main.rs         # Tauri app setup
│   │   └── commands/       # Tauri commands
│   ├── Cargo.toml          # Rust dependencies
│   ├── tauri.conf.json     # Tauri config
│   ├── icons/              # App icons
│   └── capabilities/       # Permission configuration
├── agent-backend/          # Python agent backend (unchanged)
└── ...
```

---

## Installation

### Initial Setup (New Project)

```bash
# Using npm (recommended)
npm create tauri-app@latest

# Using cargo (Rust)
cargo install tauri-cli
cargo tauri init
```

### Adding Tauri to Existing React Project

```bash
cd your-react-project
npm install --save-dev @tauri-apps/cli
npm run tauri init
```

---

## Configuration

### tauri.conf.json

Key configuration sections:

```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [{
      "title": "Agent Marketplace Demo",
      "width": 1200,
      "height": 800,
      "resizable": true,
      "fullscreen": false,
      "decorations": true
    }]
  },
  "bundle": {
    "identifier": "com.agentmarketplace.demo",
    "targets": ["app", "dmg", "msi"]
  }
}
```

---

## Tauri Commands (IPC)

Commands are the bridge between frontend and Rust backend.

### Define a Command (Rust)

```rust
// src-tauri/src/commands/mod.rs
use tauri::State;

#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn get_agent_state(agent_id: u32) -> Result<AgentState, String> {
    // Fetch from Python backend or local cache
    Ok(AgentState {
        id: agent_id,
        state: "working".to_string(),
        position: (100.0, 200.0),
    })
}

#[tauri::command]
async fn save_to_file(path: String, content: String) -> Result<(), String> {
    // Native file operations
    std::fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}
```

### Register Commands

```rust
// src-tauri/src/lib.rs
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::get_agent_state,
            commands::save_to_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Call Commands from Frontend

```typescript
// src/hooks/useAgentBackend.ts
import { invoke } from '@tauri-apps/api/core';

export async function getAgentState(agentId: number): Promise<AgentState> {
  return await invoke('get_agent_state', { agentId });
}

export async function saveToFile(path: string, content: string): Promise<void> {
  return await invoke('save_to_file', { path, content });
}

// Usage in React component
import { getAgentState } from './hooks/useAgentBackend';

function AgentPanel() {
  const [agent, setAgent] = useState<AgentState | null>(null);
  
  useEffect(() => {
    getAgentState(1).then(setAgent);
  }, []);
  
  return <div>{agent?.state}</div>;
}
```

---

## Permissions & Security

Tauri is secure by default. You must explicitly allow APIs.

### capabilities/default.json

```json
{
  "identifier": "default",
  "description": "permissions needed for agent marketplace demo",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:allow-start-dragging",
    "core:window:allow-maximize",
    "core:window:allow-minimize",
    "core:window:allow-close",
    "fs:allow-read-file",
    "fs:allow-write-file",
    "dialog:allow-save",
    "dialog:allow-open"
  ]
}
```

### Security Best Practices

1. **Never expose dangerous commands** to frontend
2. **Validate all inputs** in Rust, not just TypeScript
3. **Use specific permissions** (not wildcards)
4. **Sanitize file paths** to prevent path traversal
5. **Use environment variables** for secrets

---

## Building & Distribution

### Development Mode

```bash
npm run tauri dev
# Runs Vite dev server and Tauri WebView
```

### Build for Production

```bash
npm run tauri build
# Creates:
#   - src-tauri/target/release/bundle/app/
#   - src-tauri/target/release/bundle/dmg/  (macOS)
#   - src-tauri/target/release/bundle/msi/  (Windows)
#   - src-tauri/target/release/bundle/deb/  (Linux)
```

### Update Configuration

```bash
npm run tauri signer generate
npm run tauri signer sign --private-key <key>
```

---

## Common Use Cases

### File System Access

```rust
#[tauri::command]
async fn load_config(path: String) -> Result<String, String> {
    let content = std::fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    Ok(content)
}
```

### System Information

```rust
#[tauri::command]
async fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        cores: num_cpus::get(),
    })
}
```

### HTTP Requests from Rust

```rust
use reqwest::Client;

#[tauri::command]
async fn fetch_from_backend(url: String) -> Result<String, String> {
    let client = Client::new();
    let response = client.get(&url)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    let body = response.text()
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(body)
}
```

### Background Tasks

```rust
use std::sync::mpsc;
use tauri::AppHandle;

#[tauri::command]
fn start_background_task(app: AppHandle) -> Result<(), String> {
    let (tx, rx) = mpsc::channel();
    
    std::thread::spawn(move || {
        loop {
            // Do background work
            match rx.try_recv() {
                Ok(_) => break,
                _ => {}
            }
        }
    });
    
    Ok(())
}
```

---

## Best Practices

### 1. Keep Frontend Portable

Design your React app to work both:
- Standalone in browser (without Tauri)
- Inside Tauri WebView

```typescript
// Detect if running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

if (isTauri) {
  // Use Tauri commands
} else {
  // Use HTTP API (for web deployment)
}
```

### 2. Use TypeScript Types Shared with Rust

```rust
// src-tauri/src/types.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentState {
    pub id: u32,
    pub state: String,
    pub position: (f32, f32),
}
```

```typescript
// src/types.ts
export interface AgentState {
  id: number;
  state: string;
  position: [number, number];
}
```

### 3. Error Handling

Always use `Result<T, String>` in Rust commands:

```rust
#[tauri::command]
fn risky_operation() -> Result<SuccessData, String> {
    // Wrap potentially failing operations
    let result = some_operation()
        .map_err(|e| format!("Operation failed: {}", e))?;
    
    Ok(SuccessData { /* ... */ })
}
```

Handle errors in TypeScript:

```typescript
try {
  const result = await riskyOperation();
} catch (error) {
  console.error('Command failed:', error);
  // Show error to user
}
```

### 4. Async Operations

For async Rust code:

```rust
#[tauri::command]
async fn async_operation() -> Result<String, String> {
    let result = some_async_fn().await
        .map_err(|e| e.to_string())?;
    
    Ok(result)
}
```

### 5. Performance Optimization

- Batch commands (don't call invoke() too frequently)
- Use shared state for caching
- Debounce user input before sending commands
- Use streaming for large data transfers

---

## Debugging

### Frontend (React)

Open DevTools:
```json
// tauri.conf.json
{
  "build": {
    "devPath": "http://localhost:5173"
  }
}
```

Use browser DevTools in development mode.

### Backend (Rust)

Add logging:

```rust
use log::{info, error};

#[tauri::command]
fn some_command() {
    info!("Command executed");
    error!("Something went wrong: {}", e);
}
```

Enable logs:
```bash
RUST_LOG=debug npm run tauri dev
```

---

## Resources

- **Official Docs:** https://tauri.app/v1/guides/
- **API Reference:** https://tauri.app/v1/api/js/
- **Examples:** https://github.com/tauri-apps/tauri/tree/dev/examples
- **Community:** https://discord.com/invite/tauri
- **Tauri Awesome:** https://github.com/tauri-apps/awesome-tauri

---

## When to Use Tauri vs Pure Web

### Use Tauri when:
- You need offline capability
- Performance is critical (10,000+ agents)
- You need native OS access (file system, notifications)
- You're distributing as a desktop application

### Use Pure Web when:
- You want instant sharing (URL)
- Fast prototyping is priority
- Deployment simplicity matters
- Performance needs are moderate (<5000 agents)

---

**Last Updated:** February 2, 2026
**Status:** Reference for optional Tauri wrapper
