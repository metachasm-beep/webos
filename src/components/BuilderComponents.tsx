"use client";

import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  Menu, 
  X, 
  Zap, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Palette, 
  Layers, 
  Settings, 
  Sparkles, 
  ChevronRight, 
  Monitor, 
  Smartphone, 
  Tablet,
  Star,
  Quote,
  ShieldCheck,
  Globe,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
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
      <div className="space-y-6">
        <ShinyText 
          text={node.heading || "Revolutionize Your Workflow"} 
          className="text-6xl md:text-8xl font-heading font-bold italic tracking-tighter leading-[0.9] text-white" 
          speed={3}
        />
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
          {node.subheading || "Deploy high-fidelity assets across your entire business matrix."}
        </p>
        <div className="flex justify-center pt-8">
          <StarBorder speed="4s" color="#3b82f6">
            <div className="flex items-center gap-3">
               <span className="font-bold uppercase tracking-widest text-xs">{node.ctaText || "Deploy Now"}</span>
               <ChevronRight className="h-4 w-4" />
            </div>
          </StarBorder>
        </div>
      </div>
    </section>
  );
}

export function LeadMagnetNode({ node }: NodeProps) {
  return (
    <section className="glass rounded-[40px] p-16 grid md:grid-cols-2 gap-12 items-center relative overflow-hidden border-accent/20">
      <div className="space-y-8">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            <Sparkles className="h-3 w-3 text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Lead Generation Engine</span>
         </div>
         <h2 className="text-5xl font-heading font-bold italic tracking-tight leading-tight">
            {node.heading || "Ready to scale your business?"}
         </h2>
         <p className="text-lg text-muted-foreground font-light leading-relaxed">
            {node.subheading || "Get our exclusive growth framework delivered to your inbox."}
         </p>
         <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your professional email..." 
              className="flex-1 h-14 rounded-2xl px-6 bg-white/5 border border-white/10 focus:border-accent/50 outline-none transition-all"
            />
            <Button className="h-14 rounded-2xl px-8 bg-accent text-black font-bold uppercase tracking-widest text-xs">
              {node.ctaText || "Get Access"}
            </Button>
         </div>
         <p className="text-[9px] text-muted-foreground opacity-50 uppercase tracking-widest">
            Used by over 500+ professionals worldwide.
         </p>
      </div>
      <div className="aspect-square glass-dark rounded-[32px] p-12 flex items-center justify-center relative group">
         <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]" />
         <div className="text-center space-y-4">
            <div className="h-24 w-24 rounded-3xl bg-accent/10 flex items-center justify-center text-accent mx-auto">
               <Zap className="h-12 w-12" />
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.3em]">Value synthesis...</div>
         </div>
      </div>
    </section>
  );
}

export function ServiceGridNode({ node }: NodeProps) {
  return (
    <section className="py-24 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-4xl font-heading font-bold italic tracking-tight">{node.heading || "High-Performance Services"}</h2>
        <p className="text-muted-foreground">{node.subheading || "Engineered for growth."}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(node.services || [
          { icon: Globe, title: 'Global Sync', text: 'Real-time synchronization across edge nodes.' },
          { icon: ShieldCheck, title: 'Neural Security', text: 'Automated threat detection and encryption.' },
          { icon: Zap, title: 'Edge Synthesis', text: 'Latency-free asset generation.' },
          { icon: Users, title: 'Matrix Flow', text: 'Optimized user journey orchestration.' }
        ]).map((service: any, idx: number) => {
          const Icon = service.icon || Star;
          return (
            <div key={idx} className="glass-dark group hover:bg-primary/5 transition-all p-8 border-none bg-primary/5 rounded-[32px]">
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <Icon className="h-6 w-6" />
               </div>
               <h3 className="text-lg font-bold mb-3">{service.title}</h3>
               <p className="text-sm text-muted-foreground leading-relaxed">{service.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function TestimonialNode({ node }: NodeProps) {
  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto glass rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
        <Quote className="h-12 w-12 text-primary opacity-20 absolute top-8 left-8" />
        <div className="flex justify-center gap-1 mb-10">
          {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}
        </div>
        <blockquote className="text-2xl md:text-3xl font-heading font-medium italic mb-12 leading-relaxed">
          "{node.quote || 'WebOS has completely transformed our growth trajectory.'}"
        </blockquote>
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary/40 p-1">
             <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                <Users className="h-8 w-8 text-primary opacity-40" />
             </div>
          </div>
          <div>
            <div className="font-bold">{node.author || 'Sarah Jenkins'}</div>
            <div className="text-[10px] text-primary/60 uppercase tracking-[0.2em]">{node.role || 'Growth Director'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ErrorNode({ node }: NodeProps) {
  return (
    <div className="glass-card p-16 border-red-500/30 bg-red-500/5 text-center space-y-6">
      <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
        <AlertCircle className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-heading font-bold italic text-red-400">{node.heading || "Matrix Synthesis Interrupted"}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{node.subheading || "The neural link encountered a protocol collision."}</p>
      </div>
      <Button 
        variant="ghost" 
        onClick={() => window.location.reload()}
        className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10"
      >
        Retry Protocol
      </Button>
    </div>
  );
}

export function RenderNode({ node, idx, onUpdate }: { node: any, idx: number, onUpdate?: (idx: number, content: any) => void }) {
  if (node.error) return <ErrorNode node={node} />;
  
  const type = node.type?.toLowerCase() || "";

  if (type.includes("hero")) return <HeroNode node={node} />;
  if (type.includes("feature")) return <FeaturesNode node={node} />;
  if (type.includes("pricing")) return <PricingNode node={node} />;
  if (type.includes("cta")) return <CTANode node={node} />;
  if (type.includes("lead") || type.includes("magnet") || type.includes("capture")) return <LeadMagnetNode node={node} />;
  if (type.includes("service")) return <ServiceGridNode node={node} />;
  if (type.includes("testimonial")) return <TestimonialNode node={node} />;
  
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


