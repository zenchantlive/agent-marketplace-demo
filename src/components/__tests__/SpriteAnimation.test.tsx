import { describe, it, expect } from 'vitest'
import { getAnimationFrame, getSpriteColor } from '../spriteAnimation'

describe('SpriteAnimation helpers', () => {
  it('cycles through animation frames', () => {
    const frames = [0, 1, 2]
    const tick = 0
    expect(getAnimationFrame(frames, 0, tick, 4)).toBe(0)
    expect(getAnimationFrame(frames, 0, tick + 4, 4)).toBe(1)
    expect(getAnimationFrame(frames, 0, tick + 8, 4)).toBe(2)
  })

  it('loops back to start', () => {
    const frames = [0, 1]
    expect(getAnimationFrame(frames, 0, 0, 2)).toBe(0)
    expect(getAnimationFrame(frames, 0, 2, 2)).toBe(1)
    expect(getAnimationFrame(frames, 0, 4, 2)).toBe(0)
  })

  it('returns correct color per state', () => {
    expect(getSpriteColor('idle')).toBe('#4ade80')
    expect(getSpriteColor('working')).toBe('#f97316')
    expect(getSpriteColor('communicating')).toBe('#3b82f6')
    expect(getSpriteColor('unknown')).toBe('#4ade80')
  })
})
