# PROJECT PROTOCOL

**Project:** agent-marketplace-demo
**Location:** /home/clawdbot/agent-marketplace-demo/
**Locked:** 2026-02-02

This file enforces project isolation. All file operations must stay within this project.

## Quick Commands

```bash
# Check if path is in project
/home/clawdbot/bin/project-enforcer.sh <path> agent-marketplace-demo

# If path is outside project → STOP and ask Jordan
```

## Rules

1. All code, docs, and assets stay in `/home/clawdbot/agent-marketplace-demo/`
2. No cross-project file operations
3. Use sub-agents with explicit working directory
4. Report any outside-project access attempts
