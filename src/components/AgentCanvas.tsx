import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import { useAgentBackend } from '../hooks/useAgentBackend'

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
}

function AgentSprite({ agent, onClick }: AgentSpriteProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
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

  // Simple animation - bobbing effect
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + agent.id) * 0.05
    }
  })

  // Provide default values for position
  const x = agent.position[0] ?? 0
  const y = agent.position[1] ?? 0

  return (
    <group position={[x, y, 0]}>
      <mesh
        ref={meshRef}
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
}

function AgentCanvasContent({ onAgentClick }: { onAgentClick?: (agent: AgentData) => void }) {
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

export default function AgentCanvas({ onAgentClick }: AgentCanvasProps) {
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
          <AgentCanvasContent onAgentClick={onAgentClick} />

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
