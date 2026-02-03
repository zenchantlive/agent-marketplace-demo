import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePauseResume } from '../pauseResume'

describe('usePauseResume hook', () => {
  it('starts unpaused', () => {
    const { result } = renderHook(() => usePauseResume())
    expect(result.current.paused).toBe(false)
  })

  it('pauses when pause is called', () => {
    const { result } = renderHook(() => usePauseResume())
    act(() => {
      result.current.pause()
    })
    expect(result.current.paused).toBe(true)
  })

  it('resumes when resume is called', () => {
    const { result } = renderHook(() => usePauseResume())
    act(() => {
      result.current.pause()
      result.current.resume()
    })
    expect(result.current.paused).toBe(false)
  })

  it('toggles between paused and unpaused', () => {
    const { result } = renderHook(() => usePauseResume())
    act(() => {
      result.current.toggle()
    })
    expect(result.current.paused).toBe(true)
    act(() => {
      result.current.toggle()
    })
    expect(result.current.paused).toBe(false)
  })
})
