'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { CommandTable, ExecutiveNodes, HolographicAmbience } from './HolographicCommandTable';

/**
 * AntigravityScene - Black-Ops Command Center
 *
 * Holographic tactical table with 21 executive nodes.
 * Think: Tony Stark's workshop meets CIA situation room.
 */
export default function AntigravityScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 4, 8], fov: 60 }}
        className="bg-transparent"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          {/* Dramatic lighting for command center feel */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[0, 10, 5]} intensity={0.8} color="#ffffff" />
          <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#3b82f6" />
          <pointLight position={[0, 5, 0]} intensity={1.5} color="#3b82f6" distance={15} />

          {/* Command table */}
          <CommandTable />

          {/* 21 Executive nodes */}
          <ExecutiveNodes />

          {/* Holographic ambience particles */}
          <HolographicAmbience />
        </Suspense>
      </Canvas>
    </div>
  );
}
