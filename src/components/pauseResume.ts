import { useState } from 'react'

export function usePauseResume() {
  const [paused, setPaused] = useState(false)

  const pause = () => setPaused(true)
  const resume = () => setPaused(false)
  const toggle = () => setPaused((prev) => !prev)

  return { paused, pause, resume, toggle }
}
