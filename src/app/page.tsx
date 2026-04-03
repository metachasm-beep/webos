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
  "Airbnb", "PhonePe", "Notion", "Figma", "Linear", "Vercel", "Shopify",
  "Atlassian", "Salesforce", "HubSpot", "Slack", "Zoom", "Canva",
];

function BrandMarquee() {
  // Double the list so the seamless loop works perfectly
  const items = [...BRANDS, ...BRANDS];
  return (
    <div className="relative overflow-hidden py-10 border-y border-white/5 select-none" aria-label="Partner Brands">
      <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <motion.div
        className="flex gap-24 w-max items-center"
        animate={{ x: [0, -60 * BRANDS.length * 4] }}
        transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
      >
        {items.map((brand, i) => (
          <span
            key={i}
            className="text-[18px] md:text-[22px] font-heading font-black uppercase tracking-[0.5em] text-white/10 hover:text-primary/40 transition-all duration-500 whitespace-nowrap italic"
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

  const scrollToHero = () => {
    heroRef.current?.scrollIntoView({ behavior: "smooth" });
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
                    Start with a complete website audit—covering performance, SEO, 
                    and accessibility. Apply the insights to optimize your current site, 
                    or build a new one from scratch using our AI-powered builder.
                  </motion.p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="max-w-xl"
                >
                  <form onSubmit={handleAudit} className="group relative" aria-label="Website Audit Form">
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
                  <div className="absolute bottom-8 left-8 right-8 z-20 space-y-2 text-left">
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
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20 space-y-4"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary">Everything in one place</p>
              <h2 className="text-5xl md:text-6xl font-heading font-bold italic tracking-tight">Why teams choose us</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="md:col-span-8 glass-card group cursor-pointer hover:border-primary/40 transition-all duration-500 overflow-hidden relative flex flex-col justify-between p-8"
              >
                <div className="absolute top-0 right-0 p-8">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-heading font-bold italic underline decoration-primary/30 decoration-4 underline-offset-4">AI Website Builder</h3>
                    <p className="text-muted-foreground max-w-md text-[13px] font-body leading-relaxed">
                      Describe your ideal digital footprint. Our neural engine synthesizes a high-converting, fully-responsive landing page using our proprietary component node system.
                    </p>
                  </div>
                  <Button variant="ghost" className="gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary/5 p-0 h-auto">
                    Initialize Builder <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
                <div className="mt-8 h-48 glass-dark rounded-xl border border-white/10 group-hover:border-primary/20 transition-colors duration-700 p-4 relative overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <div className="text-[8px] uppercase tracking-widest text-primary/70 font-bold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> SYNTHESIS_ACTIVE
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 overflow-hidden">
                    <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
                    <div className="h-1.5 w-1/2 bg-blue-500/30 rounded-full" />
                    <div className="h-1.5 w-5/6 bg-white/10 rounded-full" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-20 w-1/3 border border-white/5 rounded-lg flex flex-col p-3 gap-2 bg-white/[0.02]">
                         <div className="h-1.5 w-1/2 bg-white/20 rounded-full" />
                         <div className="flex-1" />
                         <div className="h-1.5 w-full bg-primary/30 rounded-full" />
                         <div className="h-1.5 w-2/3 bg-primary/30 rounded-full" />
                      </div>
                      <div className="h-20 w-2/3 border border-indigo-500/10 rounded-lg flex flex-col p-3 gap-2 bg-indigo-500/[0.02]">
                         <div className="h-1.5 w-1/4 bg-indigo-500/40 rounded-full" />
                         <div className="flex-1" />
                         <div className="flex gap-2">
                           <div className="h-6 w-16 bg-blue-500/20 rounded-md border border-blue-500/30 flex items-center justify-center">
                             <span className="text-[6px] font-bold text-blue-300">HERO_NODE</span>
                           </div>
                           <div className="h-6 w-16 bg-purple-500/20 rounded-md border border-purple-500/30 flex items-center justify-center">
                             <span className="text-[6px] font-bold text-purple-300">CTA_NODE</span>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="md:col-span-4 glass-card group cursor-pointer hover:border-accent/40 transition-all duration-500 flex flex-col justify-between p-8"
              >
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-heading font-bold italic">Deep Audit</h3>
                    <p className="text-muted-foreground text-[13px] leading-relaxed">
                      7-point scan extracting raw Lighthouse telemetry. We pinpoint layout shifts, SEO gaps, and latency bottlenecks.
                    </p>
                  </div>
                </div>
                <div className="pt-6 space-y-4">
                  {[
                    { label: "Performance", score: 98, color: "bg-green-500" },
                    { label: "Accessibility", score: 100, color: "bg-green-500" },
                    { label: "Best Practices", score: 95, color: "bg-green-500" },
                    { label: "SEO", score: 84, color: "bg-yellow-500" },
                  ].map((stat, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>{stat.label}</span>
                        <span className="text-white">{stat.score}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${stat.color} rounded-full`} 
                          initial={{ width: 0 }} 
                          whileInView={{ width: `${stat.score}%` }} 
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="md:col-span-4 glass-card group cursor-pointer hover:border-white/20 transition-all duration-500 flex flex-col gap-4 p-8 relative overflow-hidden"
              >
                <Smartphone className="h-8 w-8 text-white/30" />
                <div className="space-y-2 relative z-10">
                  <h4 className="text-2xl font-heading font-bold italic">Mobile-First Priority</h4>
                  <p className="text-muted-foreground text-[13px] font-body leading-relaxed">
                    Audits simulate 4G throttling on standard viewports. We enforce strict mobile performance thresholds by default.
                  </p>
                </div>
                <div className="mt-auto pt-4 flex gap-3 overflow-hidden h-24 opacity-60 group-hover:opacity-100 transition-opacity items-end">
                   <div className="w-1/3 bg-white/5 rounded-t-xl border border-white/10 shadow-inner p-2 flex gap-1 justify-center relative translate-y-4 group-hover:translate-y-2 transition-transform duration-500">
                     <div className="w-1 h-full bg-primary/30 rounded-full" />
                     <div className="w-1 h-3/4 bg-primary/30 rounded-full mt-auto" />
                     <div className="w-1 h-1/2 bg-primary/30 rounded-full mt-auto" />
                   </div>
                    <div className="w-2/3 bg-white/10 rounded-t-xl border border-white/20 p-3 shadow-2xl relative translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="h-1.5 w-1/3 bg-white/30 rounded-full mb-3" />
                      <div className="h-10 w-full bg-primary/10 rounded-lg flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <span className="text-[9px] text-primary uppercase font-black tracking-widest">Mobile Priority</span>
                      </div>
                    </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="md:col-span-8 glass-card border-none bg-primary text-primary-foreground relative overflow-hidden group p-8"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
                  <Zap className="h-[300px] w-[300px]" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                  <div className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 text-[10px] uppercase tracking-widest font-bold text-white/90">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" /> System Ready
                    </div>
                    <h3 className="text-3xl md:text-4xl font-heading font-bold italic">Deploy your digital footprint.</h3>
                    <p className="text-primary-foreground/80 text-[14px] max-w-sm leading-relaxed">
                      Stop losing traffic to slow loads and bad SEO. Let WebOS AI rewrite the rules for your digital success.
                    </p>
                  </div>
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      scrollToHero();
                    }}
                    size="lg" 
                    className="rounded-2xl px-10 h-14 bg-white text-black hover:bg-white/90 shadow-2xl transition-all font-bold uppercase tracking-[0.2em] text-[10px] whitespace-nowrap hidden md:flex"
                  >
                    Start Free Audit
                  </Button>
                  {/* Mobile CTA */}
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      scrollToHero();
                    }}
                    size="lg" 
                    className="w-full md:hidden rounded-2xl h-14 bg-white text-black hover:bg-white/90 shadow-2xl transition-all font-bold uppercase tracking-[0.2em] text-[10px]"
                  >
                    Start Free Audit
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-32 relative">
          <div className="container mx-auto px-4">
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="py-2 md:py-4 border-t border-white/5 relative bg-background/50 backdrop-blur-3xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Branding */}
            <div className="flex items-center gap-6">
              <img 
                src="/assets/branding/logo_full.png" 
                alt="WebOS AI Logo" 
                className="h-11 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              />
              <p className="hidden md:block text-[11px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Audit. Build. Dominate.</p>
            </div>
            
            {/* Contacts & Links Grouped */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-muted-foreground/40 uppercase font-bold tracking-widest">E-mail</span>
                <span className="text-sm font-bold">info@turtlelabs.co.in</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-muted-foreground/40 uppercase font-bold tracking-widest">Registry</span>
                <div className="flex gap-6">
                  <Link href="https://www.turtlelabs.co.in" className="text-sm text-muted-foreground hover:text-white transition-colors">Site</Link>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Docs</Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-muted-foreground/40 uppercase font-bold tracking-widest">Social</span>
                <div className="flex gap-6">
                  <Link href="https://twitter.com/turtlelabsindia" className="text-sm text-muted-foreground hover:text-white transition-colors">X</Link>
                  <Link href="https://www.instagram.com/turtlelabs/" className="text-sm text-muted-foreground hover:text-white transition-colors">IG</Link>
                </div>
              </div>
            </div>

            {/* Copyright Inline */}
            <div className="text-[11px] text-muted-foreground/20 uppercase tracking-[0.4em] font-bold whitespace-nowrap">
              © 2026 WebOS AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
