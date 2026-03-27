"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, useScroll, useTransform } from "framer-motion";
import { NeuralBackground } from "@/components/NeuralBackground";
import { Canvas } from "@react-three/fiber";
import { NeuralCore } from "@/components/NeuralCore";
import { 
  ArrowRight, 
  BarChart3, 
  Globe, 
  Zap, 
  Sparkles, 
  Smartphone,
  ChevronDown
} from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  
  // Hero animations
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const heroRotate = useTransform(scrollYProgress, [0, 0.2], [0, 5]);

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      router.push(`/audit?url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <Navbar />
      <NeuralBackground />
      
      <main className="flex-1">
        {/* Cinematic Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          <div className="container px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                style={{ opacity, scale: heroScale, rotateX: heroRotate }}
                className="text-left space-y-12 max-w-2xl"
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border-white/10 text-primary text-[11px] font-bold uppercase tracking-[0.3em]"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    Distributed Edge Protocols Active
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="text-7xl md:text-9xl font-heading font-bold leading-[0.9] tracking-tighter"
                  >
                    MATRIX <br />
                    <span className="text-glow-soft">SYNTHESIS</span>
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-lg md:text-xl text-muted-foreground font-body max-w-xl leading-relaxed tracking-tight"
                  >
                    Synchronize your enterprise footprint with the world's most elegant performance matrix. 
                    Neural heuristics designed for the high-end digital frontier.
                  </motion.p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="max-w-xl"
                >
                  <form onSubmit={handleAudit} className="group relative">
                    <div className="absolute -inset-4 bg-primary/5 rounded-[40px] blur-2xl group-hover:bg-primary/10 transition-all duration-700" />
                    <div className="relative glass rounded-[32px] p-2 flex items-center gap-2 border-white/10 overflow-hidden">
                      <div className="pl-6 flex items-center gap-3 border-r border-white/10 pr-6 group-focus-within:border-primary/30 transition-colors">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input 
                        placeholder="https://your-enterprise.com" 
                        className="border-none bg-transparent focus-visible:ring-0 text-foreground h-14 shadow-none placeholder:text-muted-foreground/30 text-lg font-body"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <Button type="submit" className="rounded-2xl px-10 h-14 bg-primary hover:bg-primary/80 transition-all gap-3 shadow-2xl shadow-primary/20 font-bold uppercase tracking-widest text-xs">
                        Audit
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.2 }}
                className="relative h-[600px] hidden lg:block cursor-grab active:cursor-grabbing"
              >
                <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <Canvas>
                  <NeuralCore />
                </Canvas>
              </motion.div>
            </div>
          </div>

          <motion.div 
            style={{ opacity }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/30"
          >
             <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Initialize Sequence</span>
             <ChevronDown className="h-4 w-4" />
          </motion.div>
        </section>

        {/* Cinematic Bento Showcase */}
        <section id="features" className="py-32 relative">
          <div className="container px-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="md:col-span-8 glass-card group cursor-pointer hover:border-primary/40 transition-all duration-500 overflow-hidden relative"
              >
                 <div className="absolute top-0 right-0 p-8">
                    <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                 </div>
                 <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                       <h3 className="text-4xl font-heading font-bold italic underline decoration-primary/30 decoration-4 underline-offset-8">Neural Builder</h3>
                       <p className="text-muted-foreground max-w-sm text-lg font-body leading-relaxed">Synthesis of design and code. Generate high-conversion nodes via natural language protocols.</p>
                    </div>
                    <Button variant="ghost" className="gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary/5 p-0">
                       Explore Module <ArrowRight className="h-3 w-3" />
                    </Button>
                 </div>
                 <div className="mt-12 h-64 glass-dark rounded-t-3xl border-t border-x border-white/10 translate-y-8 group-hover:translate-y-4 transition-transform duration-700" />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="md:col-span-4 glass-card group cursor-pointer hover:border-accent/40 transition-all duration-500 flex flex-col justify-between"
              >
                 <div className="space-y-6">
                    <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                       <BarChart3 className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-3xl font-heading font-bold italic">Deep Insight</h3>
                       <p className="text-muted-foreground text-sm leading-relaxed">7-layer forensic scan of your digital environment. Real-time PageSpeed integration.</p>
                    </div>
                 </div>
                 <div className="pt-8 grid grid-cols-2 gap-3">
                    <div className="glass-dark p-4 rounded-2xl text-center">
                       <div className="text-[10px] font-bold text-accent uppercase tracking-widest">SEO</div>
                       <div className="text-2xl font-bold">98</div>
                    </div>
                    <div className="glass-dark p-4 rounded-2xl text-center">
                       <div className="text-[10px] font-bold text-primary uppercase tracking-widest">UX</div>
                       <div className="text-2xl font-bold">84</div>
                    </div>
                 </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="md:col-span-4 glass-card group cursor-pointer hover:border-white/20 transition-all duration-500 flex flex-col gap-6"
              >
                 <Smartphone className="h-10 w-10 text-white/30" />
                 <h4 className="text-2xl font-heading font-bold italic">Global Edge</h4>
                 <p className="text-muted-foreground text-sm font-body">Sub-second latency distribution across a high-availability mesh network. Optimized for zero fragmentation.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="md:col-span-8 glass-card border-none bg-primary text-primary-foreground relative overflow-hidden group"
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                    <div className="space-y-4 text-center md:text-left">
                       <h3 className="text-4xl font-heading font-bold italic">Ready to accelerate?</h3>
                       <p className="text-primary-foreground/70 max-w-sm">Synchronize your business with the WebOS growth matrix today.</p>
                    </div>
                    <Button size="lg" className="rounded-full px-12 h-16 bg-white text-black hover:bg-white/90 shadow-2xl transition-all font-bold uppercase tracking-widest text-xs">
                       Initiate Sequence
                    </Button>
                 </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 relative bg-background/50 backdrop-blur-3xl">
        <div className="container px-4">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="space-y-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                   <Zap className="h-6 w-6 text-primary" />
                   <span className="text-2xl font-heading font-bold text-glow-soft">WebOS</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">The Business Growth Matrix</p>
              </div>
              
              <div className="flex gap-12">
                 <div className="space-y-4">
                    <h5 className="text-[10px] uppercase tracking-widest font-bold text-primary">Protocol</h5>
                    <ul className="space-y-2 text-xs text-muted-foreground font-body">
                       <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                       <li><Link href="#" className="hover:text-white transition-colors">API Layers</Link></li>
                    </ul>
                 </div>
                 <div className="space-y-4">
                    <h5 className="text-[10px] uppercase tracking-widest font-bold text-primary">Network</h5>
                    <ul className="space-y-2 text-xs text-muted-foreground font-body">
                       <li><Link href="#" className="hover:text-white transition-colors">GitHub</Link></li>
                       <li><Link href="#" className="hover:text-white transition-colors">Twitter X</Link></li>
                    </ul>
                 </div>
              </div>
           </div>
           <div className="mt-20 pt-8 border-t border-white/5 text-[9px] text-center text-muted-foreground/30 uppercase tracking-[0.4em] font-bold">
              © 2026 WebOS High Performance Matrix. Fragmented in Silence.
           </div>
        </div>
      </footer>
    </div>
  );
}
