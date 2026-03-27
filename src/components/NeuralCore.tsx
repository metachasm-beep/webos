"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Stars, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

export function NeuralCore() {
  const sphereRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.1;
      sphereRef.current.rotation.z = t * 0.15;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f2fe" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#4facfe" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere ref={sphereRef} args={[1, 64, 64]}>
          <MeshDistortMaterial
            color="#4facfe"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0}
            metalness={1}
            emissive="#00f2fe"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </Sphere>
        
        {/* Outer Wireframe Glow */}
        <Sphere args={[1.2, 32, 32]}>
          <meshPhongMaterial
            color="#00f2fe"
            wireframe
            transparent
            opacity={0.1}
          />
        </Sphere>
      </Float>
    </>
  );
}
