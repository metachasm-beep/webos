"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Layout, Sparkles, Zap, Shield, Globe } from 'lucide-react';

interface BentoCard {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
}

interface BentoGridProps {
  node: {
    heading?: string;
    subheading?: string;
    items?: BentoCard[];
  };
  onContentChange?: (updates: any) => void;
}

const sizeClasses = {
  small: "col-span-1 row-span-1",
  medium: "col-span-2 row-span-1",
  large: "col-span-2 row-span-2",
  wide: "col-span-3 row-span-1",
  tall: "col-span-1 row-span-2"
};

export function BentoGridNode({ node, onContentChange }: BentoGridProps) {
  const items = node.items || [
    { id: '1', title: 'Neural Synthesis', description: 'Real-time AI orchestration.', size: 'large', icon: 'Zap' },
    { id: '2', title: 'Global Edge', description: 'Zero-latency deployment.', size: 'small', icon: 'Globe' },
    { id: '3', title: 'Secure Matrix', description: 'Enterprise-grade protection.', size: 'small', icon: 'Shield' },
    { id: '4', title: 'Industrial Design', description: 'Boutique aesthetics for high-fidelity brands.', size: 'medium', icon: 'Layout' }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto space-y-12">
      <div className="space-y-4 text-center">
         <h2 className="text-4xl md:text-6xl font-heading font-bold italic tracking-tighter leading-tight" contentEditable onBlur={(e) => onContentChange?.({ heading: e.target.innerText })} suppressContentEditableWarning>
           {node.heading || "The Bento Matrix"}
         </h2>
         <p className="text-xl text-muted-foreground max-w-2xl mx-auto" contentEditable onBlur={(e) => onContentChange?.({ subheading: e.target.innerText })} suppressContentEditableWarning>
           {node.subheading || "High-fidelity modular orchestration inspired by premium design standards."}
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] gap-4">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={`glass group relative overflow-hidden rounded-[32px] border border-white/5 p-8 flex flex-col justify-between hover:border-primary/30 transition-all ${sizeClasses[item.size] || sizeClasses.small}`}
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 space-y-4">
               <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
               </div>
            </div>

            <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
               <Layout className="h-32 w-32" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
