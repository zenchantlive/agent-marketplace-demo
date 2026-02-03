export function getAnimationFrame(
  frames: number[],
  startTimeMs: number,
  currentTimeMs: number,
  frameDurationMs = 100,
) {
  const elapsed = Math.max(0, currentTimeMs - startTimeMs)
  const frameIndex = Math.floor(elapsed / frameDurationMs) % frames.length
  return frames[frameIndex]
}

export function getSpriteColor(state: string) {
  switch (state) {
    case 'idle':
      return '#4ade80'
    case 'working':
      return '#f97316'
    case 'communicating':
      return '#3b82f6'
    default:
      return '#4ade80'
  }
}
