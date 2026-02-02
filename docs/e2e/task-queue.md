# Task Queue E2E Plan (agent-browser)

## Scenarios
1. **Render**: Task Queue panel visible on load
2. **Add Task**: Create task via UI and see it in list
3. **Filter**: Filter by status (In Progress)
4. **Details**: Click task → details panel opens

## Steps (agent-browser)
- Start dev server: `npm run dev`
- `agent-browser open http://localhost:5173`
- `agent-browser snapshot`
- Use refs to click Add Task, fill form, submit
- Snapshot after each step

## Acceptance
- All 4 scenarios pass
- No console errors
- 1280x720 viewport

---

## Run Log (2026-02-02)

### Snapshot 1 (initial load)
```
- Task Queue panel visible
- Filter dropdown present
- Task list present
```

### Snapshot 2 (Add Task)
```
- Entered "New Task" and clicked Add Task
- "New Task" appeared in list
```

### Snapshot 3 (Filter)
```
- Filter set to In Progress
- Only "Implement backend" shown
```

### Snapshot 4 (Details)
```
- Clicked "Implement backend"
- Task Details panel rendered with name, status, assignee
```

### Result
✅ **All 4 E2E scenarios passed**
