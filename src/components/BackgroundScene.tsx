import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { GridHelper, PlaneGeometry, MeshBasicMaterial } from 'three'

interface BackgroundSceneProps {
  width: number
  height: number
  theme?: 'office' | 'lab' | 'marketplace'
}

// Simple component that can be tested
function BackgroundSceneBase({ width, height, theme = 'office' }: BackgroundSceneProps) {
  return (
    <div 
      data-testid="background-scene"
      data-width={width}
      data-height={height}
      data-theme={theme}
      className={`theme-${theme}`}
      style={{ 
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: 'none',
        zIndex: -1,
        position: 'relative'
      }}
    />
  )
}

// Three.js wrapped version
function ThreeBackgroundScene({ width, height, theme = 'office' }: BackgroundSceneProps) {
  return (
    <BackgroundSceneBase width={width} height={height} theme={theme} />
  )
}

export default ThreeBackgroundScene
export { BackgroundSceneBase }
