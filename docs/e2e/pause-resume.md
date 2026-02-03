# Pause/Resume Controls E2E (agent-browser)

## Scenario
Verify pause/resume button stops and resumes agent movement.

## Steps
1. Start dev server
2. Open app in agent-browser
3. Screenshot initial state (Pause button visible)
4. Click Pause button
5. Wait 3s → agents should NOT move
6. Screenshot paused state (Resume button visible)
7. Click Resume button
8. Wait 3s → agents should move again
9. Screenshot resumed state (Pause button visible)

## Artifacts
- /tmp/pause-1-initial.png
- /tmp/pause-2-paused.png
- /tmp/pause-3-resumed.png

## Result
✅ Pause button toggles to Resume
✅ Agents stop when paused (visual verification)
✅ Agents resume moving when resumed
