"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * React Bridge for Svelte-Glow logic.
 * Implements mouse-tracking radial gradients as requested.
 */
export function SvelteBridgeGlowCard({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for high-performance feel
  const springX = useSpring(mouseX, { damping: 20, stiffness: 300 });
  const springY = useSpring(mouseY, { damping: 20, stiffness: 300 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/[0.07] ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at var(--x) var(--y), rgba(59, 130, 246, 0.1), transparent 40%)`,
          // Note: using CSS variables with framer-motion springs
          // @ts-ignore
          "--x": springX.get() + "px",
          // @ts-ignore
          "--y": springY.get() + "px",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * React Bridge for Svelte-Typist logic.
 */
export function SvelteBridgeTypist({ 
  text, 
  speed = 30,
  delay = 500 
}: { 
  text: string; 
  speed?: number;
  delay?: number;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!isStarted || displayedText.length >= text.length) return;

    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1));
    }, speed);

    return () => clearInterval(interval);
  }, [isStarted, displayedText, text, speed]);

  return (
    <div className="font-mono text-sm leading-relaxed text-foreground/80">
      {displayedText}
      <span className="w-1.5 h-4 bg-primary inline-block ml-1 animate-pulse align-middle" />
    </div>
  );
}
