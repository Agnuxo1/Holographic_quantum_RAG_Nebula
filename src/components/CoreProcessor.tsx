import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { QUANTUM_CONSTANTS } from '../lib/quantum/QuantumMath';

interface CoreProcessorProps {
  position: [number, number, number];
  scale: number;
}

export function CoreProcessor({ position, scale }: CoreProcessorProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
      materialRef.current.uniforms.quantumFlux.value = 
        Math.sin(clock.getElapsedTime() * 2) * 0.5 + 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[2, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          time: { value: 0 },
          resolution: { value: new THREE.Vector2(1024, 1024) },
          quantumFlux: { value: 0 },
          photonStrength: { value: QUANTUM_CONSTANTS.PHOTON_INTERACTION_STRENGTH }
        }}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vNormal;
          
          void main() {
            vUv = uv;
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform vec2 resolution;
          uniform float quantumFlux;
          uniform float photonStrength;
          
          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vNormal;
          
          vec3 colorA = vec3(0.1, 0.3, 1.0);
          vec3 colorB = vec3(0.0, 0.5, 1.0);
          vec3 colorC = vec3(0.2, 0.0, 0.8);
          
          float rand(vec2 co) {
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
          }
          
          void main() {
            vec2 p = vUv * 2.0 - 1.0;
            float len = length(p);
            
            // Quantum interference pattern
            float pattern = sin(len * 20.0 - time * 2.0) * 0.5 + 0.5;
            
            // Holographic effect
            float hologram = sin(vPosition.x * 20.0 + time) * 
                           cos(vPosition.y * 20.0 - time) * 
                           sin(vPosition.z * 20.0 + time * 0.5);
            
            // Quantum probability field
            float quantum = rand(vUv + time * 0.1) * quantumFlux * photonStrength;
            
            // Energy levels
            float energy = pow(pattern * hologram, 2.0) + quantum;
            
            // Color mixing based on energy levels
            vec3 color = mix(colorA, colorB, pattern);
            color = mix(color, colorC, hologram * 0.5);
            color *= energy;
            
            // Fresnel-like edge glow
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            color += vec3(0.3, 0.6, 1.0) * fresnel;
            
            // Quantum fluctuations
            color *= 0.8 + 0.2 * quantum;
            
            gl_FragColor = vec4(color, 0.95);
          }
        `}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}