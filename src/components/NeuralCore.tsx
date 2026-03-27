"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

export function NeuralCore() {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Data-heavy point cloud synthesis
  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  const dataNodes = [
    { label: "FCP", value: "0.8s", pos: [2, 2, 2] },
    { label: "LCP", value: "1.2s", pos: [-2, -2, 2] },
    { label: "CLS", value: "0.01", pos: [2, -2, -2] },
    { label: "FID", value: "14ms", pos: [-2, 2, -2] },
    { label: "TTFB", value: "0.2s", pos: [0, 3, 0] },
    { label: "SI", value: "1.5s", pos: [0, -3, 0] }
  ];

  return (
    <group>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* Floating Data Nodes */}
      {dataNodes.map((node, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1} position={node.pos as any}>
          <Html distanceFactor={10}>
            <div className="whitespace-nowrap flex flex-col items-center gap-1 group">
              <div className="h-0.5 w-12 bg-primary/30 group-hover:w-16 transition-all" />
              <div className="px-3 py-1 glass-dark rounded-md border border-primary/20 backdrop-blur-md">
                <span className="text-[8px] font-bold text-primary uppercase tracking-widest mr-2">{node.label}</span>
                <span className="text-[10px] font-heading font-bold text-white">{node.value}</span>
              </div>
            </div>
          </Html>
        </Float>
      ))}

      {/* Core Energy Field */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.05} wireframe />
      </mesh>
    </group>
  );
}
