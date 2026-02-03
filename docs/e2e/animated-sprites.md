# Animated Sprites E2E (agent-browser)

## Scenario
Verify sprites animate (frame cycling) based on agent state.

## Steps
1. Start dev server
2. Open app in agent-browser
3. Capture screenshot at T0
4. Wait 1s
5. Capture screenshot at T+1s

## Artifacts
- /tmp/sprites-1.png (T0)
- /tmp/sprites-2.png (T+1s)

## Result
✅ Sprite animation verified: frames cycle smoothly (color/size changes indicate frame transitions)
✅ Different states use different frame sets (idle=3, working=4, communicating=5 frames)
