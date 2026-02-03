import { describe, it, expect } from 'vitest'
import { truncateMessage, shouldShowBubble } from '../messageBubbles'

describe('MessageBubbles helpers', () => {
  it('truncates long messages', () => {
    const long = 'This is a very long message that needs to be truncated because it is way too long for a small bubble'
    const truncated = truncateMessage(long, 20)
    expect(truncated.length).toBeLessThanOrEqual(23) // 20 + '...'
    expect(truncated).toContain('...')
  })

  it('does not truncate short messages', () => {
    const short = 'Hello'
    expect(truncateMessage(short, 20)).toBe('Hello')
  })

  it('shouldShowBubble returns true for communicating state', () => {
    expect(shouldShowBubble('communicating')).toBe(true)
    expect(shouldShowBubble('idle')).toBe(false)
    expect(shouldShowBubble('working')).toBe(false)
  })
})
