"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { NeuralBackground } from "@/components/NeuralBackground";
import { ContactForm } from "@/components/ContactForm";
import LetterGlitch from "@/components/LetterGlitch";
import { 
  ArrowRight, 
  BarChart3, 
  Globe, 
  Zap, 
  Sparkles, 
  Smartphone,
  ChevronDown
} from "lucide-react";

// Brand logos marquee list
const BRANDS = [
  "Google", "Apple", "Nike", "Tesla", "Amazon", "Netflix", "Spotify",
  "Airbnb", "Stripe", "Notion", "Figma", "Linear", "Vercel", "Shopify",
  "Atlassian", "Salesforce", "HubSpot", "Slack", "Zoom", "Canva",
];

function BrandMarquee() {
  // Double the list so the seamless loop works perfectly
  const items = [...BRANDS, ...BRANDS];
  return (
    <div className="relative overflow-hidden py-10 border-y border-white/5 select-none">
      <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <motion.div
        className="flex gap-16 w-max"
        animate={{ x: [0, -50 * BRANDS.length * 4] }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
      >
        {items.map((brand, i) => (
          <span
            key={i}
            className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30 hover:text-muted-foreground transition-colors whitespace-nowrap"
          >
            {brand}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);

  // Scroll-driven fade
  const opacity  = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  // Mouse parallax for the 3D canvas
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const rotateX = useTransform(springY, [-300, 300], [8, -8]);
  const rotateY = useTransform(springX, [-300, 300], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) router.push(`/audit?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <Navbar />
      <NeuralBackground />
      
      <main className="flex-1">
        {/* Hero */}
        <section
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative min-h-screen flex items-center justify-center pt-20"
        >
          <div className="container px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Copy */}
              <motion.div 
                style={{ opacity, scale: heroScale }}
                className="text-left space-y-12 max-w-2xl"
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border-white/10 text-primary text-[11px] font-bold uppercase tracking-[0.3em]"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    Free website audit — takes 30 seconds
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="text-7xl md:text-9xl font-heading font-bold leading-[0.9] tracking-tighter"
                  >
                    AUDIT. BUILD. <br />
                    <span className="text-glow-soft text-primary">DOMINATE.</span>
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-lg md:text-xl text-muted-foreground font-body max-w-xl leading-relaxed tracking-tight"
                  >
                    Enter your website URL and get a full performance, SEO, and 
                    accessibility report in seconds — then fix it with our AI-powered builder.
                  </motion.p>
                </div>

                {/* URL Input */}
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
                        placeholder="https://yourwebsite.com" 
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

              {/* 3D Canvas — reacts to mouse */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.2 }}
                style={{ rotateX, rotateY, transformPerspective: 1200 }}
                className="relative h-[600px] hidden lg:block cursor-grab active:cursor-grabbing"
              >
                <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="w-full h-full rounded-[40px] overflow-hidden border border-white/10 glass-card p-0 bg-black/40 relative">
                  <div className="absolute inset-0 z-0">
                    <LetterGlitch 
                      glitchColors={['#3b82f6', '#22c55e', '#1e40af']}
                      centerVignette={true}
                      outerVignette={false}
                      smooth={true}
                      glitchSpeed={40}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <div className="absolute bottom-8 left-8 right-8 z-20 space-y-2">
                    <div className="h-1 w-12 bg-primary rounded-full" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">Neural Link Active</p>
                    <h4 className="text-xl font-heading font-bold italic text-white">GROWTH_MATRIX_v2.0</h4>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div 
            style={{ opacity }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/30"
          >
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold">See how it works</span>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </section>

        {/* Trusted-by Brand Marquee */}
        <BrandMarquee />

        {/* Features Bento */}
        <section id="features" className="py-32 relative">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20 space-y-4"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary">Everything in one place</p>
              <h2 className="text-5xl md:text-6xl font-heading font-bold italic tracking-tight">Why teams choose us</h2>
            </motion.div>

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
                    <h3 className="text-4xl font-heading font-bold italic underline decoration-primary/30 decoration-4 underline-offset-8">AI Website Builder</h3>
                    <p className="text-muted-foreground max-w-sm text-lg font-body leading-relaxed">Describe what you need in plain English. We'll generate a high-converting landing page in seconds.</p>
                  </div>
                  <Button variant="ghost" className="gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary/5 p-0">
                    Try the Builder <ArrowRight className="h-3 w-3" />
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
                    <h3 className="text-3xl font-heading font-bold italic">Deep Audit</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">7-point scan covering speed, SEO, accessibility, and security — with real Lighthouse scores.</p>
                  </div>
                </div>
                <div className="pt-8 grid grid-cols-2 gap-3">
                  <div className="glass-dark p-4 rounded-2xl text-center">
                    <div className="text-[10px] font-bold text-accent uppercase tracking-widest">SEO</div>
                    <div className="text-2xl font-bold">98</div>
                  </div>
                  <div className="glass-dark p-4 rounded-2xl text-center">
                    <div className="text-[10px] font-bold text-primary uppercase tracking-widest">SPEED</div>
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
                <h4 className="text-2xl font-heading font-bold italic">Mobile-First</h4>
                <p className="text-muted-foreground text-sm font-body">All audits run on mobile by default — because that's where your customers are.</p>
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
                    <h3 className="text-4xl font-heading font-bold italic">Ready to grow?</h3>
                    <p className="text-primary-foreground/70 max-w-sm">Join thousands of businesses using TurtleLabs to improve their online presence.</p>
                  </div>
                  <Button size="lg" className="rounded-full px-12 h-16 bg-white text-black hover:bg-white/90 shadow-2xl transition-all font-bold uppercase tracking-widest text-xs">
                    Start Free Audit
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-32 relative">
          <div className="container px-4">
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 relative bg-background/50 backdrop-blur-3xl">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <span className="text-2xl font-heading font-bold text-glow-soft">TurtleLabs <span className="text-primary italic">WebOS</span></span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Audit. Build. Dominate.</p>
              <div className="space-y-1 pt-4">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">Contact</p>
                <p className="text-sm font-heading font-bold">[email protected]</p>
                <p className="text-sm font-heading font-bold">+91 6309052625</p>
              </div>
            </div>
            
            <div className="flex gap-12">
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-primary">Links</h5>
                <ul className="space-y-2 text-xs text-muted-foreground font-body">
                  <li><Link href="https://www.turtlelabs.co.in" className="hover:text-white transition-colors">Official Site</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-primary">Social</h5>
                <ul className="space-y-2 text-xs text-muted-foreground font-body">
                  <li><Link href="https://twitter.com/turtlelabsindia" className="hover:text-white transition-colors">Twitter / X</Link></li>
                  <li><Link href="https://www.instagram.com/turtlelabs/" className="hover:text-white transition-colors">Instagram</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/5 text-[9px] text-center text-muted-foreground/30 uppercase tracking-[0.4em] font-bold">
            © 2026 TurtleLabs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
