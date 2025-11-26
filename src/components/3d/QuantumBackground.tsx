'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

function ParticleField() {
    const count = 4000; // Number of particles
    const mesh = useRef<THREE.InstancedMesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    // Generate random positions and speeds for particles
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    // Reusable dummy object for positioning
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!mesh.current) return;

        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;

            // Update time/position
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            // Update position based on "warp" logic
            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );

            // Scale particles for "twinkle" effect
            const scale = (Math.sin(t * 5) + 1.5) * 0.5; // Base scale
            dummy.scale.set(scale, scale, scale);

            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            mesh.current!.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;

        // Rotate the entire field slowly
        mesh.current.rotation.y += 0.001;
        mesh.current.rotation.x += 0.0005;
    });

    return (
        <>
            <pointLight ref={lightRef} distance={40} intensity={8} color="#4338ca" />
            <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
                <dodecahedronGeometry args={[0.1, 0]} />
                <meshPhongMaterial
                    color="#6366f1" // Indigo-500
                    emissive="#4f46e5" // Indigo-600
                    emissiveIntensity={0.5}
                    shininess={50}
                />
            </instancedMesh>
        </>
    );
}

function Scene() {
    return (
        <>
            <ParticleField />
            <EffectComposer>
                <Bloom
                    luminanceThreshold={0.1} // Lower threshold to catch more glow
                    mipmapBlur
                    intensity={2.0} // High intensity for "Holy-Fuck" glow
                    radius={0.6}
                />
            </EffectComposer>
        </>
    );
}

export default function QuantumBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-black">
            <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
                {/* Ambient light for base visibility */}
                <ambientLight intensity={0.2} color="#1e1b4b" />
                <Scene />
                {/* Fog to fade particles into the distance */}
                <fog attach="fog" args={['#000000', 10, 60]} />
            </Canvas>
        </div>
    );
}
