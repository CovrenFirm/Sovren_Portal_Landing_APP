'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex Shader: Simple full-screen quad
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader: Volumetric Nebula / FBM Noise
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractal Brownian Motion
  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 3; ++i) { // Reduced from 5 to 3 for much softer, less dense look
      v += a * snoise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Zoom in significantly to make "clouds" larger and less compacted
    vec2 uv = vUv * 0.4; 
    
    // Slower, majestic movement
    float time = uTime * 0.05;
    
    // Generate noise pattern
    vec2 q = vec2(0.);
    q.x = fbm( uv + 0.00*time);
    q.y = fbm( uv + vec2(1.0));
    
    vec2 r = vec2(0.);
    r.x = fbm( uv + 1.0*q + vec2(1.7,9.2)+ 0.15*time );
    r.y = fbm( uv + 1.0*q + vec2(8.3,2.8)+ 0.126*time);
    
    float f = fbm(uv+r);
    
    // Color Palette: Deep Indigo to Electric Violet - REFINED FOR SUBTLETY
    vec3 color = mix(
        vec3(0.0, 0.0, 0.02), // Deepest Black/Blue
        vec3(0.05, 0.05, 0.15),  // Very Dark Indigo
        clamp((f*f)*3.0, 0.0, 1.0)
    );
    
    color = mix(
        color,
        vec3(0.1, 0.1, 0.3), // Dark Violet
        clamp(length(q), 0.0, 1.0)
    );
    
    color = mix(
        color,
        vec3(0.2, 0.15, 0.5), // Muted Electric Blue
        clamp(length(r.x), 0.0, 1.0)
    );

    // Vignette
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(vUv - 0.5)); // Use original vUv for vignette
    color *= vignette;

    // Output - Reduced overall opacity/brightness
    gl_FragColor = vec4((f*f*f + 0.5*f*f + 0.3*f) * color * 0.7, 1.0);
  }
`;

function NebulaPlane() {
    const meshRef = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(1, 1) },
        }),
        []
    );

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef} scale={[2, 2, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
}

export default function OrbitalBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-black">
            <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
                <NebulaPlane />
            </Canvas>
        </div>
    );
}
