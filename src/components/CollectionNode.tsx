"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { User, Globe, ExternalLink, Mail } from 'lucide-react';

interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
}

interface CollectionProps {
  node: {
    heading?: string;
    subheading?: string;
    items?: CollectionItem[];
  };
  onContentChange?: (updates: any) => void;
}

export function CollectionNode({ node, onContentChange }: CollectionProps) {
  const items = node.items || [
    { id: '1', title: 'Marcus Vance', subtitle: 'Chief Neural Architect' },
    { id: '2', title: 'Elena Rossi', subtitle: 'Lead Synthesis Designer' },
    { id: '3', title: 'David Chen', subtitle: 'Strategic Growth Lead' }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
      <div className="space-y-4">
         <h2 className="text-4xl md:text-5xl font-heading font-bold italic tracking-tight" contentEditable onBlur={(e) => onContentChange?.({ heading: e.target.innerText })} suppressContentEditableWarning>
           {node.heading || "The Vanguard Team"}
         </h2>
         <p className="text-xl text-muted-foreground max-w-2xl" contentEditable onBlur={(e) => onContentChange?.({ subheading: e.target.innerText })} suppressContentEditableWarning>
           {node.subheading || "Engineered for high-fidelity execution and strategic synthesis."}
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group space-y-6"
          >
            <div className="aspect-[4/5] rounded-[32px] bg-white/5 border border-white/5 overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500">
               <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                  <User className="h-32 w-32" />
               </div>
               
               {/* Social Sync */}
               <div className="absolute bottom-6 left-6 flex gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">
                  {[Globe, ExternalLink, Mail].map((Icon, i) => (
                    <div key={i} className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors cursor-pointer">
                       <Icon className="h-4 w-4" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-1">
               <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
               <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary">{item.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
