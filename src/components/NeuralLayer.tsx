import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { QUANTUM_CONSTANTS } from '../lib/quantum/QuantumMath';

interface NeuralLayerProps {
  radius: number;
  neuronCount: number;
}

export function NeuralLayer({ radius, neuronCount }: NeuralLayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const { neurons, connections } = useMemo(() => {
    const temp = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    
    // Generate neurons in a Fibonacci spiral for optimal distribution
    for (let i = 0; i < neuronCount; i++) {
      const y = 1 - (i / (neuronCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      
      temp.push(new THREE.Vector3(x * radius, y * radius, z * radius));
    }

    // Create quantum-entangled connections
    const conns = [];
    for (let i = 0; i < temp.length; i++) {
      for (let j = i + 1; j < temp.length; j++) {
        if (Math.random() < QUANTUM_CONSTANTS.PHOTON_INTERACTION_STRENGTH * 0.5) {
          const strength = Math.random();
          conns.push({
            points: [temp[i], temp[j]],
            color: new THREE.Color(
              0.1 + strength * 0.2,
              0.3 + strength * 0.4,
              0.7 + strength * 0.3
            ),
            strength
          });
        }
      }
    }
    
    return { neurons: temp, connections: conns };
  }, [radius, neuronCount]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      
      // Quantum wave function animation
      groupRef.current.rotation.y = time * 0.1;
      
      // Apply quantum fluctuations to neurons
      groupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const phase = time + i * 0.1;
          child.position.x += Math.sin(phase) * 0.002;
          child.position.y += Math.cos(phase * 1.3) * 0.002;
          child.position.z += Math.sin(phase * 0.7) * 0.002;
          
          const material = child.material as THREE.MeshStandardMaterial;
          material.emissiveIntensity = 0.5 + Math.sin(phase) * 0.2;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {neurons.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color={new THREE.Color(0.1, 0.5, 1.0)}
            emissive={new THREE.Color(0.1, 0.5, 1.0)}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
      
      {connections.map((conn, i) => (
        <Line
          key={i}
          points={conn.points}
          color={conn.color}
          lineWidth={1}
          transparent
          opacity={0.1 + conn.strength * 0.2}
        />
      ))}
    </group>
  );
}