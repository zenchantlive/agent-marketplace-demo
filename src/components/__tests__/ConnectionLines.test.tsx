import { describe, it, expect } from 'vitest'
import { shouldDrawLine, getLineColor } from '../connectionLines'

describe('ConnectionLines helpers', () => {
  it('shouldDrawLine returns true for communicating agents', () => {
    expect(shouldDrawLine('communicating', 'communicating')).toBe(true)
    expect(shouldDrawLine('communicating', 'idle')).toBe(false)
    expect(shouldDrawLine('idle', 'idle')).toBe(false)
  })

  it('getLineColor returns correct color', () => {
    expect(getLineColor('communicating')).toBe('#3b82f6')
    expect(getLineColor('idle')).toBe('transparent')
  })
})
