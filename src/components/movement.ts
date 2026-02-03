export type Vec2 = [number, number]

export function interpolatePosition(current: Vec2, target: Vec2, speed: number): Vec2 {
  const dx = target[0] - current[0]
  const dy = target[1] - current[1]
  return [current[0] + dx * speed, current[1] + dy * speed]
}

export function reachedTarget(current: Vec2, target: Vec2, tolerance = 0.1): boolean {
  const dx = target[0] - current[0]
  const dy = target[1] - current[1]
  return Math.hypot(dx, dy) <= tolerance
}
