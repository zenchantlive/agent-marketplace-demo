import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { Suspense } from 'react'
import BackgroundScene from './BackgroundScene'

function ThreeScene() {
  return (
    <div className="three-container">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          {/* Background Scene - Office/Workspace Environment */}
          <BackgroundScene width={20} height={15} />

          {/* Demo Sprite - Simple colored square representing an agent */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 0.1]} />
            <meshStandardMaterial color="#4ade80" />
          </mesh>

          {/* Text Label */}
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Agent Demo
          </Text>

          {/* Camera Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={false}
            minDistance={2}
            maxDistance={10}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default ThreeScene
