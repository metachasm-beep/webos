"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const fragmentShader = `
  uniform float time;
  uniform vec2 resolution;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float noise = sin(uv.x * 10.0 + time) * cos(uv.y * 10.0 + time) * 0.1;
    vec3 color1 = vec3(0.02, 0.05, 0.1); // Deep Dark
    vec3 color2 = vec3(0.1, 0.2, 0.4); // Slate Blue
    vec3 color3 = vec3(0.01, 0.02, 0.05); // Almost Black
    
    float t = uv.y + noise;
    vec3 finalColor = mix(color1, color2, smoothstep(0.0, 1.0, t));
    finalColor = mix(finalColor, color3, smoothstep(0.5, 1.5, uv.x));
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function ShaderBackground() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      resolution: { value: new THREE.Vector2() },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.time.value = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export function NeuralBackground() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ShaderBackground />
      </Canvas>
    </div>
  );
}
