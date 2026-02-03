import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import { useAgentBackend } from '../hooks/useAgentBackend'
import { interpolatePosition, reachedTarget, Vec2 } from './movement'

interface AgentData {
  id: number
  position: number[]
  state: string
  nearby_agents?: number[]
  reasoning?: string
}

interface AgentSpriteProps {
  agent: AgentData
  onClick: (agent: AgentData) => void
  paused?: boolean
}

function AgentSprite({ agent, onClick, paused = false }: AgentSpriteProps) {
  const groupRef = useRef<THREE.Group>(null)
  const positionRef = useRef<Vec2>([agent.position[0] ?? 0, agent.position[1] ?? 0])
  const targetRef = useRef<Vec2>([agent.position[0] ?? 0, agent.position[1] ?? 0])
  const lastTargetTimeRef = useRef<number>(0)
  
  // Get color based on state
  const getColor = () => {
    switch (agent.state) {
      case 'idle':
        return '#4ade80' // green
      case 'working':
        return '#f97316' // orange
      case 'communicating':
        return '#3b82f6' // blue
      default:
        return '#4ade80'
    }
  }

  // Smooth movement + bobbing
  useFrame((state) => {
    if (!groupRef.current) return

    // Skip movement updates if paused
    if (paused) return

    // Update target every 3 seconds or when reached
    const elapsed = state.clock.elapsedTime
    if (elapsed - lastTargetTimeRef.current > 3 || reachedTarget(positionRef.current, targetRef.current, 0.1)) {
      targetRef.current = [
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
      ]
      lastTargetTimeRef.current = elapsed
    }

    // Interpolate toward target
    positionRef.current = interpolatePosition(positionRef.current, targetRef.current, 0.02)

    // Apply position + bobbing
    groupRef.current.position.x = positionRef.current[0]
    groupRef.current.position.y = positionRef.current[1] + Math.sin(elapsed * 2 + agent.id) * 0.05
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onClick(agent)
        }}
      >
        <boxGeometry args={[0.5, 0.5, 0.1]} />
        <meshStandardMaterial color={getColor()} />
      </mesh>
      
      {/* Agent ID label */}
      <Text
        position={[0, 0.4, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Agent {agent.id}
      </Text>
      
      {/* State label */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.15}
        color="#a1a1aa"
        anchorX="center"
        anchorY="middle"
      >
        {agent.state}
      </Text>
    </group>
  )
}

interface AgentCanvasProps {
  onAgentClick?: (agent: AgentData) => void
  paused?: boolean
}

function AgentCanvasContent({ onAgentClick, paused = false }: { onAgentClick?: (agent: AgentData) => void; paused?: boolean }) {
  const { agents, isLoading, error } = useAgentBackend()
  
  if (isLoading) {
    return (
      <group>
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Loading agents...
        </Text>
      </group>
    )
  }

  if (error) {
    return (
      <group>
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
        >
          Error: {error}
        </Text>
        <Text
          position={[0, -0.4, 0]}
          fontSize={0.2}
          color="#a1a1aa"
          anchorX="center"
          anchorY="middle"
        >
          Make sure the backend is running at http://localhost:8000
        </Text>
      </group>
    )
  }

  return (
    <>
      {/* Render all agents */}
      {agents.map((agent) => (
        <AgentSprite
          key={agent.id}
          agent={agent}
          onClick={onAgentClick || (() => {})}
          paused={paused}
        />
      ))}
      
      {/* Instructions */}
      {agents.length === 0 && (
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="#a1a1aa"
          anchorX="center"
          anchorY="middle"
        >
          No agents found. Start the backend to see agents.
        </Text>
      )}
    </>
  )
}

export default function AgentCanvas({ onAgentClick, paused }: AgentCanvasProps) {
  return (
    <div className="agent-canvas w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-[#1a1a2e]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          {/* Agent content */}
          <AgentCanvasContent onAgentClick={onAgentClick} paused={paused} />

          {/* Camera Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={false}
            minDistance={2}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
