import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { CoreProcessor } from './CoreProcessor';
import { NeuralLayer } from './NeuralLayer';
import { StarField } from './StarField';
import { Vector3 } from 'three';

export function EmergentOpticalScene() {
  const timeRef = useRef(0);

  useFrame((state) => {
    timeRef.current = state.clock.getElapsedTime();
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#4080ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.25} color="#ff8040" />
      
      {/* Core Quantum Processing Unit */}
      <CoreProcessor position={[0, 0, 0]} scale={1} />
      
      {/* Multi-layer Neural Network */}
      <group>
        <NeuralLayer radius={4} neuronCount={80} />
        <NeuralLayer radius={6} neuronCount={120} />
        <NeuralLayer radius={8} neuronCount={160} />
      </group>
      
      {/* Quantum Field Visualization */}
      <StarField count={150000} radius={20} />
      
      {/* Background Environment */}
      <Stars 
        radius={50} 
        depth={50} 
        count={7000} 
        factor={4} 
        saturation={0.5} 
        fade 
        speed={0.5} 
      />
      
      {/* Advanced Post Processing */}
      <EffectComposer multisampling={8}>
        <DepthOfField 
          focusDistance={0} 
          focalLength={0.02} 
          bokehScale={2} 
          height={480} 
        />
        <Bloom 
          intensity={1.5} 
          luminanceThreshold={0.1} 
          luminanceSmoothing={0.9} 
          blendFunction={BlendFunction.SCREEN} 
        />
        <ChromaticAberration 
          offset={[0.002, 0.002]} 
          blendFunction={BlendFunction.NORMAL} 
          radialModulation={true}
          modulationOffset={0.5}
        />
      </EffectComposer>
      
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        rotateSpeed={0.5} 
        minDistance={5} 
        maxDistance={30} 
      />
    </>
  );
}