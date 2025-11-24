'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore, ScenePhase } from '@/state/sceneStore';

/**
 * HolographicCommandTable
 *
 * Black-ops tactical situation table with 21 executive nodes.
 * Think: Tony Stark's workshop meets CIA command center.
 */

// ============================================================================
// COMMAND TABLE - Central Tactical Surface
// ============================================================================

export function CommandTable() {
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useSceneStore((state) => state.phase);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Subtle pulse based on phase
    let pulseIntensity = 0.3;
    if (phase === 'listening') pulseIntensity = 0.6;
    if (phase === 'thinking') pulseIntensity = 0.8;
    if (phase === 'responding') pulseIntensity = 1.0;

    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = pulseIntensity + Math.sin(time * 2) * 0.1;
  });

  return (
    <group rotation={[-Math.PI / 6, 0, 0]} position={[0, -1, 0]}>
      {/* Main table surface */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[8, 0.1, 6]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive="#1e40af"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Holographic grid lines on table */}
      <HolographicGrid />

      {/* Corner accent markers */}
      {[
        [-3.8, 0.06, -2.8],
        [3.8, 0.06, -2.8],
        [-3.8, 0.06, 2.8],
        [3.8, 0.06, 2.8],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.15, 0.15, 0.12, 6]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function HolographicGrid() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.getElapsedTime();
    linesRef.current.position.y = 0.06 + Math.sin(time * 3) * 0.01;
  });

  const gridLines = useMemo(() => {
    const lines: THREE.Line[] = [];
    const material = new THREE.LineBasicMaterial({
      color: '#3b82f6',
      transparent: true,
      opacity: 0.3,
    });

    // Horizontal lines
    for (let i = -2; i <= 2; i++) {
      const points = [
        new THREE.Vector3(-3.5, 0, i * 1.2),
        new THREE.Vector3(3.5, 0, i * 1.2),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      lines.push(line);
    }

    // Vertical lines
    for (let i = -3; i <= 3; i++) {
      const points = [
        new THREE.Vector3(i * 1.2, 0, -2.5),
        new THREE.Vector3(i * 1.2, 0, 2.5),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      lines.push(line);
    }

    return lines;
  }, []);

  return (
    <group ref={linesRef} position={[0, 0.06, 0]}>
      {gridLines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

// ============================================================================
// EXECUTIVE NODES - 21 Holographic Markers
// ============================================================================

export function ExecutiveNodes() {
  const selectedExecutive = useSceneStore((state) => state.selectedExecutive);
  const phase = useSceneStore((state) => state.phase);

  const executiveRoles = useMemo(
    () => [
      'CEO',
      'CFO',
      'CTO',
      'COO',
      'CRO',
      'CMO',
      'Board',
      'CHRO',
      'CLO',
      'CIO',
      'CSO',
      'CDO',
      'VP-Eng',
      'VP-Sales',
      'VP-Prod',
      'VP-Ops',
      'VP-Mktg',
      'VP-HR',
      'VP-Legal',
      'Dir-Sec',
      'Dir-Compl',
    ],
    []
  );

  // Position executives in organized rows on the table
  const executives = useMemo(() => {
    const positions: Array<{
      position: THREE.Vector3;
      role: string;
      isSelected: boolean;
      color: string;
    }> = [];

    // Layout: 3 rows of 7 executives each
    const rowSpacing = 1.8;
    const colSpacing = 1.1;
    const startZ = -1.8;
    const startX = -3.3;

    executiveRoles.forEach((role, i) => {
      const row = Math.floor(i / 7);
      const col = i % 7;

      const x = startX + col * colSpacing;
      const z = startZ + row * rowSpacing;
      const y = 0.15; // Slightly above table

      const isSelected = role === selectedExecutive;

      // Color coding by tier
      let color = '#3b82f6'; // Default blue
      if (['CEO', 'CFO', 'CTO', 'COO', 'CRO', 'CMO', 'Board'].includes(role)) {
        color = '#f59e0b'; // C-suite: amber
      } else if (role.startsWith('VP')) {
        color = '#8b5cf6'; // VPs: purple
      } else {
        color = '#10b981'; // Directors: green
      }

      positions.push({
        position: new THREE.Vector3(x, y, z),
        role,
        isSelected,
        color,
      });
    });

    return positions;
  }, [executiveRoles, selectedExecutive]);

  return (
    <group rotation={[-Math.PI / 6, 0, 0]} position={[0, -1, 0]}>
      {executives.map((exec, i) => (
        <ExecutiveNode key={i} {...exec} phase={phase} />
      ))}
    </group>
  );
}

interface ExecutiveNodeProps {
  position: THREE.Vector3;
  role: string;
  isSelected: boolean;
  color: string;
  phase: ScenePhase;
}

function ExecutiveNode({ position, role, isSelected, color, phase }: ExecutiveNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;
    const time = state.clock.getElapsedTime();

    // Pulsing animation
    let pulseSpeed = 2;
    let pulseAmount = 0.1;

    if (isSelected) {
      if (phase === 'listening') {
        pulseSpeed = 4;
        pulseAmount = 0.3;
      } else if (phase === 'thinking') {
        pulseSpeed = 3;
        pulseAmount = 0.4;
      } else if (phase === 'responding') {
        pulseSpeed = 5;
        pulseAmount = 0.25;
      } else {
        pulseSpeed = 2;
        pulseAmount = 0.15;
      }
    }

    const scale = 1 + Math.sin(time * pulseSpeed) * pulseAmount;
    meshRef.current.scale.setScalar(scale);

    // Glow ring
    glowRef.current.rotation.z = time * (isSelected ? 2 : 0.5);
    const glowScale = isSelected ? 1.5 + Math.sin(time * 3) * 0.2 : 1;
    glowRef.current.scale.setScalar(glowScale);
  });

  return (
    <group position={position}>
      {/* Core node */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 3 : 1.5}
          metalness={0.8}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>

      {/* Holographic glow ring */}
      {isSelected && (
        <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <ringGeometry args={[0.2, 0.25, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Vertical hologram beam */}
      {isSelected && (
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
    </group>
  );
}

// ============================================================================
// AMBIENT HOLOGRAPHIC EFFECTS
// ============================================================================

export function HolographicAmbience() {
  const particlesRef = useRef<THREE.Points>(null);

  // Floating holographic particles
  const particles = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = Math.random() * 4 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    return positions;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const time = state.clock.getElapsedTime();
    particlesRef.current.rotation.y = time * 0.05;

    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time + i) * 0.001;
      if (positions[i + 1] > 3) positions[i + 1] = -1;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    return geom;
  }, [particles]);

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        color="#3b82f6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
