import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BackgroundSceneBase } from '../BackgroundScene'

describe('BackgroundScene', () => {
  it('renders without crashing', () => {
    const { container } = render(<BackgroundSceneBase width={800} height={600} />)
    expect(container.querySelector('[data-testid="background-scene"]')).not.toBeNull()
  })

  it('has correct dimensions', () => {
    const { container } = render(<BackgroundSceneBase width={800} height={600} />)
    const scene = container.querySelector('[data-testid="background-scene"]')
    expect(scene?.getAttribute('data-width')).toBe('800')
    expect(scene?.getAttribute('data-height')).toBe('600')
  })

  it('does not block mouse events', () => {
    const { container } = render(<BackgroundSceneBase width={800} height={600} />)
    const scene = container.querySelector('[data-testid="background-scene"]')
    expect(scene?.getAttribute('style')).toContain('pointer-events: none')
  })

  it('renders office theme by default', () => {
    const { container } = render(<BackgroundSceneBase width={800} height={600} />)
    const scene = container.querySelector('[data-testid="background-scene"]')
    expect(scene?.getAttribute('data-theme')).toBe('office')
  })

  it('renders marketplace theme when specified', () => {
    const { container } = render(<BackgroundSceneBase width={800} height={600} theme="marketplace" />)
    const scene = container.querySelector('[data-testid="background-scene"]')
    expect(scene?.getAttribute('data-theme')).toBe('marketplace')
  })
})
