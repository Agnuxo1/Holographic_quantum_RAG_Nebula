import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Points } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

interface StarFieldProps {
  count: number;
  radius: number;
}

export function StarField({ count, radius }: StarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);
      
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);
      
      const i3 = i * 3;
      temp[i3] = x;
      temp[i3 + 1] = y;
      temp[i3 + 2] = z;
      
      // Create quantum-inspired colors
      const energy = Math.random();
      colors[i3] = 0.2 + energy * 0.3;     // R: quantum red shift
      colors[i3 + 1] = 0.5 + energy * 0.3; // G: energy level
      colors[i3 + 2] = 0.7 + energy * 0.3; // B: quantum coherence
    }
    
    return { positions: temp, colors };
  }, [count, radius]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const time = clock.getElapsedTime();
      
      // Quantum field fluctuations
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const phase = time + i * 0.0001;
        positions[i] += Math.sin(phase) * 0.01;
        positions[i + 1] += Math.cos(phase * 1.1) * 0.01;
        positions[i + 2] += Math.sin(phase * 0.7) * 0.01;
        
        // Quantum color fluctuations
        colors[i] = 0.2 + Math.sin(phase) * 0.1;
        colors[i + 1] = 0.5 + Math.cos(phase * 1.2) * 0.1;
        colors[i + 2] = 0.7 + Math.sin(phase * 0.9) * 0.1;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
          normalized
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}