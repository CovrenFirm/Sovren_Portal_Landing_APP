'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore, ScenePhase } from '@/state/sceneStore';

/**
 * AntigravityCore - Minimal OS Core Visualization
 *
 * ONLY renders:
 * - Central OS core (single sphere)
 * - 21 executive nodes (small spheres on orbital rings)
 * - Thin orbit guide lines
 *
 * NO planet textures, NO atmospheric effects, NO decorative blobs.
 * This is a clean command-center OS visualization.
 */

// ============================================================================
// CORE SPHERE - The Central Sovren OS
// ============================================================================

export function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useSceneStore((state) => state.phase);

  // Phase-based visual configuration
  const config = useMemo(() => {
    switch (phase) {
      case 'listening':
        return {
          pulseSpeed: 2.5,
          pulseAmount: 0.08,
          emissiveIntensity: 2.0,
          color: '#3b82f6', // Blue
        };
      case 'thinking':
        return {
          pulseSpeed: 1.8,
          pulseAmount: 0.12,
          emissiveIntensity: 2.5,
          color: '#8b5cf6', // Purple
        };
      case 'responding':
        return {
          pulseSpeed: 3.0,
          pulseAmount: 0.06,
          emissiveIntensity: 3.0,
          color: '#10b981', // Green
        };
      default: // idle
        return {
          pulseSpeed: 1.0,
          pulseAmount: 0.04,
          emissiveIntensity: 1.5,
          color: '#3b82f6',
        };
    }
  }, [phase]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Breathing scale animation
    const scale = 1.0 + Math.sin(time * config.pulseSpeed) * config.pulseAmount;
    meshRef.current.scale.setScalar(scale);

    // Gentle rotation
    meshRef.current.rotation.y = time * 0.1;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshStandardMaterial
        color={config.color}
        emissive={config.color}
        emissiveIntensity={config.emissiveIntensity}
        roughness={0.2}
        metalness={0.8}
        toneMapped={false}
      />
    </mesh>
  );
}

// ============================================================================
// EXECUTIVE ORBITS - 21 Nodes on 3 Rings
// ============================================================================

interface ExecutiveOrbitsProps {
  count: number;
}

export function ExecutiveOrbits({ count }: ExecutiveOrbitsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const selectedExecutive = useSceneStore((state) => state.selectedExecutive);
  const phase = useSceneStore((state) => state.phase);

  // Executive roles - MUST match VoiceConsole PERSONAS
  const executiveRoles = useMemo(() => [
    'CEO', 'CFO', 'CTO', 'COO', 'CRO', 'CMO', 'Board',
    'CHRO', 'CLO', 'CIO', 'CSO', 'CDO',
    'VP-Eng', 'VP-Sales', 'VP-Prod', 'VP-Ops', 'VP-Mktg', 'VP-HR', 'VP-Legal',
    'Dir-Sec', 'Dir-Compl'
  ], []);

  // Generate 21 executive positions on 3 orbital rings
  const executives = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Distribute: Ring 0 (7 nodes), Ring 1 (7 nodes), Ring 2 (7 nodes)
      const ringIndex = Math.floor(i / 7);
      const posInRing = i % 7;
      const nodesInRing = 7;

      // Angle for this node
      const angleOffset = ringIndex * (Math.PI / 7); // Stagger rings
      const angle = (posInRing / nodesInRing) * Math.PI * 2 + angleOffset;

      // Ring radii: 3.5, 5.0, 6.5
      const radius = 3.5 + ringIndex * 1.5;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 0.3; // Slight vertical wave

      const role = executiveRoles[i] || `Exec-${i}`;
      const isSelected = role === selectedExecutive;

      // Color by ring: inner=orange, middle=cyan, outer=purple
      let hue: number;
      if (ringIndex === 0) {
        hue = 30 + posInRing * 8; // 30-86 (orange/yellow)
      } else if (ringIndex === 1) {
        hue = 180 + posInRing * 8; // 180-236 (cyan/blue)
      } else {
        hue = 270 + posInRing * 8; // 270-326 (purple/magenta)
      }

      return {
        position: new THREE.Vector3(x, y, z),
        role,
        isSelected,
        hue,
        ringIndex,
        index: i,
      };
    });
  }, [count, selectedExecutive, executiveRoles]);

  // Rotate entire orbit system
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    let rotationSpeed = 0.15;

    if (phase === 'listening') rotationSpeed = 0.20;
    if (phase === 'thinking') rotationSpeed = 0.25;
    if (phase === 'responding') rotationSpeed = 0.18;

    groupRef.current.rotation.y = time * rotationSpeed;
  });

  return (
    <group ref={groupRef}>
      {executives.map((exec) => (
        <ExecutiveNode key={exec.index} {...exec} phase={phase} />
      ))}
      <OrbitRings />
    </group>
  );
}

// ============================================================================
// EXECUTIVE NODE - Individual Sphere
// ============================================================================

interface ExecutiveNodeProps {
  position: THREE.Vector3;
  role: string;
  isSelected: boolean;
  hue: number;
  index: number;
  ringIndex: number;
  phase: ScenePhase;
}

function ExecutiveNode({
  position,
  role,
  isSelected,
  hue,
  index,
  phase
}: ExecutiveNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetScale = useRef(1.0);
  const currentScale = useRef(1.0);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Update position with floating motion
    const bobSpeed = isSelected ? 0.8 : 0.4 + index * 0.02;
    const bobAmount = isSelected ? 0.12 : 0.06;
    const bob = Math.sin(time * bobSpeed + index * 0.5) * bobAmount;

    meshRef.current.position.copy(position);
    meshRef.current.position.y += bob;

    // Scale based on selection and phase
    if (isSelected) {
      if (phase === 'listening') {
        targetScale.current = 1.6 + Math.sin(time * 3) * 0.2;
      } else if (phase === 'thinking') {
        targetScale.current = 1.8 + Math.sin(time * 2.5) * 0.3;
      } else if (phase === 'responding') {
        targetScale.current = 2.0 + Math.sin(time * 4) * 0.25;
      } else {
        targetScale.current = 1.4;
      }
    } else {
      // Non-selected nodes dim during active phases
      targetScale.current = (phase === 'idle') ? 1.0 : 0.8;
    }

    // Smooth scale transition
    currentScale.current += (targetScale.current - currentScale.current) * 0.12;
    meshRef.current.scale.setScalar(currentScale.current);

    // Rotation
    meshRef.current.rotation.y = time * (isSelected ? 0.5 : 0.2);
  });

  // Color based on hue and selection
  const color = useMemo(() => {
    const saturation = isSelected ? 90 : 70;
    const lightness = isSelected ? 65 : 50;
    return new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }, [hue, isSelected]);

  const emissiveColor = useMemo(() => {
    const saturation = isSelected ? 85 : 60;
    const lightness = isSelected ? 50 : 35;
    return new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }, [hue, isSelected]);

  const radius = isSelected ? 0.25 : 0.15;

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={isSelected ? 2.5 : 1.0}
        roughness={0.3}
        metalness={0.9}
        toneMapped={false}
      />
    </mesh>
  );
}

// ============================================================================
// ORBIT RINGS - Thin Guide Lines
// ============================================================================

function OrbitRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.z = time * 0.02;
  });

  // Create three orbit ring geometries
  const rings = useMemo(() => {
    const radii = [3.5, 5.0, 6.5];
    return radii.map((radius, i) => {
      const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        0, 2 * Math.PI,
        false,
        0
      );
      const points = curve.getPoints(128);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: '#3b82f6',
        transparent: true,
        opacity: 0.15 - i * 0.03, // Inner rings slightly more visible
      });
      const line = new THREE.Line(geometry, material);
      line.rotation.x = Math.PI / 2;
      return line;
    });
  }, []);

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <primitive key={i} object={ring} />
      ))}
    </group>
  );
}
