"use client";

import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, Zap, ShieldCheck, BarChart3, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShinyText from "./reactbits/ShinyText";
import StarBorder from "./reactbits/StarBorder";

interface NodeProps {
  node: any;
}

export function HeroNode({ node }: NodeProps) {
  const isNeon = node.visualData?.variant === 'neon';
  const accent = node.visualData?.accentColor || "#3b82f6";

  return (
    <section className={`relative py-24 px-8 rounded-[40px] overflow-hidden ${isNeon ? 'bg-black' : 'glass'}`}>
      {node.image && (
        <div className="absolute inset-0 -z-10 opacity-20">
          <img 
            src={node.image} 
            alt="Background" 
            className="w-full h-full object-cover"
            fetchPriority="high"
            loading="eager"
          />
        </div>
      )}
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
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Section / {node.copyMetrics?.frameworkApplied || 'Standard'}</span>

        </div>
        
        <ShinyText 
          text={node.heading} 
          className="text-6xl md:text-7xl font-heading font-bold italic tracking-tighter leading-[0.9]" 
          speed={3}
        />
        
        <p className="text-xl text-muted-foreground font-body leading-relaxed">
          {node.subheading}
        </p>
        
        <div className="flex items-center gap-6">
          <StarBorder speed="4s" color={accent}>
            <Button size="lg" className="rounded-2xl px-10 h-16 bg-transparent text-white font-bold uppercase tracking-widest text-xs">
              {node.ctaText}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </StarBorder>
          <div className="flex items-center gap-2 opacity-50">
             <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
             <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Global Deployment Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeatureNode({ node }: NodeProps) {
  return (
    <div className="antigravity-glass antigravity-float rounded-[32px] p-10 space-y-4 border border-white/5 hover:border-primary/20 transition-all">
      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
         <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="text-2xl font-heading font-bold italic tracking-tight">{node.title}</h3>
      <p className="text-muted-foreground leading-relaxed font-light">{node.description}</p>
    </div>
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
            <h4 className="text-xl font-bold italic font-heading">Feature 0{i}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">High-performance optimization for your business growth.</p>

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
                  Key Highlight {f}

                </li>
              ))}
            </ul>
          </div>
          <Button className={`w-full h-12 rounded-xl mt-12 font-bold uppercase tracking-widest text-[9px] ${i === 1 ? 'bg-primary' : 'bg-white/5 hover:bg-white/10'}`}>
            Get Started

          </Button>
        </div>
      ))}
    </section>
  );
}

export function CTANode({ node }: NodeProps) {
  return (
    <section className="glass rounded-[40px] p-16 text-center space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <center className="space-y-6">
        <ShinyText 
          text={node.heading || "Revolutionize Your Workflow"} 
          className="text-6xl md:text-8xl font-heading font-bold italic tracking-tighter leading-[0.9] text-white" 
          speed={3}
        />
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
          {node.subheading}
        </p>
        <div className="flex justify-center pt-8">
          <StarBorder speed="4s" color="#3b82f6">
            <div className="flex items-center gap-3">
               <span className="font-bold uppercase tracking-widest text-xs">{node.ctaText || "Deploy Now"}</span>
               <ChevronRight className="h-4 w-4" />
            </div>
          </StarBorder>
        </div>
      </center>
    </section>
  );
}

export function RenderNode({ node }: NodeProps) {
  const type = node.type?.toLowerCase() || "";

  if (type.includes("hero")) return <HeroNode node={node} />;
  if (type.includes("feature")) return <FeaturesNode node={node} />;
  if (type.includes("pricing")) return <PricingNode node={node} />;
  if (type.includes("cta")) return <CTANode node={node} />;
  
  // High-fidelity fallback that guesses based on structure if type is weird
  if (node.heading && node.ctaText && !node.features) return <HeroNode node={node} />;
  
  return (
    <div className="glass-card p-12 text-center italic text-muted-foreground flex flex-col items-center gap-4">
      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
      <span className="text-[10px] uppercase font-bold tracking-widest">Synthesizing {node.type || 'Component'}...</span>
      <p className="text-[8px] opacity-50 not-italic">If this takes too long, try refreshing the generator.</p>
    </div>
  );
}

