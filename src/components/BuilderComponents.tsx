"use client";

import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, Zap, ShieldCheck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NodeProps {
  node: any;
}

export function HeroNode({ node }: NodeProps) {
  const isNeon = node.visualData?.variant === 'neon';
  const accent = node.visualData?.accentColor || "#3b82f6";

  return (
    <section className={`relative py-24 px-8 rounded-[40px] overflow-hidden ${isNeon ? 'bg-black' : 'glass'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      {isNeon && (
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 blur-[120px] rounded-full opacity-20"
          style={{ backgroundColor: accent }}
        />
      )}
      
      <div className="relative z-10 max-w-2xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-12 bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Genesis Node / {node.copyMetrics?.frameworkApplied}</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-heading font-bold italic tracking-tighter leading-[0.9]">
          {node.heading}
        </h1>
        
        <p className="text-xl text-muted-foreground font-body leading-relaxed">
          {node.subheading}
        </p>
        
        <div className="flex items-center gap-6">
          <Button size="lg" className="rounded-2xl px-10 h-16 bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-2xl shadow-primary/20">
            {node.ctaText}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 opacity-50">
             <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
             <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Global Deployment Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturesNode({ node }: NodeProps) {
  return (
    <section className="glass rounded-[40px] p-12 space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-heading font-bold italic tracking-tight">{node.heading}</h2>
        <p className="text-muted-foreground max-w-sm">{node.subheading}</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-dark p-8 rounded-3xl space-y-4 group hover:border-primary/30 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <h4 className="text-xl font-bold italic font-heading">Sub-Protocol 0{i}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Advanced neural optimization for high-conversion synaptic flow.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PricingNode({ node }: NodeProps) {
  return (
    <section className="grid md:grid-cols-3 gap-8">
      {["Seed", "Growth", "Enterprise"].map((tier, i) => (
        <div key={i} className={`glass-card p-10 flex flex-col justify-between relative overflow-hidden ${i === 1 ? 'border-primary/50 bg-primary/5' : ''}`}>
          {i === 1 && (
            <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-bold uppercase px-4 py-1 tracking-widest rounded-bl-xl">Recommended</div>
          )}
          <div className="space-y-6">
            <div className="space-y-1">
               <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{tier}</p>
               <h3 className="text-4xl font-heading font-bold italic">${i === 0 ? "49" : i === 1 ? "199" : "Custom"}</h3>
            </div>
            <ul className="space-y-3">
              {[1, 2, 3, 4].map((f) => (
                <li key={f} className="flex items-center gap-3 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Synaptic Feature {f}
                </li>
              ))}
            </ul>
          </div>
          <Button className={`w-full h-12 rounded-xl mt-12 font-bold uppercase tracking-widest text-[9px] ${i === 1 ? 'bg-primary' : 'bg-white/5 hover:bg-white/10'}`}>
            Select Protocol
          </Button>
        </div>
      ))}
    </section>
  );
}

export function RenderNode({ node }: NodeProps) {
  const type = node.type?.toLowerCase() || "";

  if (type.includes("hero")) return <HeroNode node={node} />;
  if (type.includes("feature")) return <FeaturesNode node={node} />;
  if (type.includes("pricing")) return <PricingNode node={node} />;
  
  return (
    <div className="glass-card p-12 text-center italic text-muted-foreground">
      Synthesizing component of type: {node.type}
    </div>
  );
}
