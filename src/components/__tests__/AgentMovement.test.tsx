import { describe, it, expect } from 'vitest'
import { interpolatePosition, reachedTarget } from '../movement'

describe('Agent Movement helpers', () => {
  it('interpolates toward target', () => {
    const next = interpolatePosition([0, 0], [10, 0], 0.1)
    expect(next[0]).toBeGreaterThan(0)
    expect(next[0]).toBeLessThan(10)
  })

  it('reaches target within tolerance', () => {
    const done = reachedTarget([9.99, 0], [10, 0], 0.05)
    expect(done).toBe(true)
  })
})
