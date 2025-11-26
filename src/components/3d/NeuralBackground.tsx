'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Vertex Shader: Projects the plane and handles the "infinite" look
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    vUv = uv;
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader: Draws the anti-aliased grid and handles the glow/fog
const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    // Grid settings
    float gridSize = 20.0; // Number of cells
    float speed = 0.15;
    
    // Scroll the grid
    vec2 uv = vUv * gridSize;
    uv.y += uTime * speed;

    // Calculate grid lines using derivatives for perfect anti-aliasing (no Moiré)
    vec2 grid = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
    float line = min(grid.x, grid.y);
    
    // Soften the lines
    float alpha = 1.0 - min(line, 1.0);
    
    // Distance fade (Fog)
    // Calculate distance from center/camera to fade out the horizon
    float dist = length(vPos.xy); // Simple radial distance from center of plane
    float fade = smoothstep(0.5, 0.0, distance(vUv, vec2(0.5))); // Circular fade mask
    
    // Vertical fade (Horizon)
    float horizonFade = smoothstep(0.0, 0.2, vUv.y); // Fade out at the very top/bottom if needed
    
    // Combine alpha with fade
    alpha *= fade * 1.5; // Boost intensity in the center

    // Add a "pulse" or "scanline" moving across
    float scanline = sin(vUv.y * 10.0 - uTime * 2.0) * 0.1;
    
    // Final color
    vec3 finalColor = uColor + scanline;
    
    gl_FragColor = vec4(finalColor, alpha * 0.8);
  }
`;

function GridPlane() {
    const meshRef = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#6366f1') }, // Indigo-500
        }),
        []
    );

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        // Rotated to be a "floor" extending into the screen
        <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, 0, -5]}>
            {/* Massive plane */}
            <planeGeometry args={[100, 100]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                side={THREE.DoubleSide}
                depthWrite={false} // Important for transparency
            />
        </mesh>
    );
}

function Scene() {
    return (
        <>
            <GridPlane />
            <EffectComposer disableNormalPass>
                <Bloom
                    luminanceThreshold={0.0} // Bloom everything that has color
                    mipmapBlur
                    intensity={1.5}
                    radius={0.6}
                />
            </EffectComposer>
        </>
    );
}

export default function NeuralBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-black">
            <Canvas camera={{ position: [0, 1, 5], fov: 75 }}>
                <Scene />
                {/* Background color to blend with */}
                <color attach="background" args={['#000000']} />
            </Canvas>
        </div>
    );
}
