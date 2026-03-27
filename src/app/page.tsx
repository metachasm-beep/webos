"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  BarChart3, 
  Globe, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Shield, 
  Smartphone,
  MousePointer2
} from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      router.push(`/audit?url=${encodeURIComponent(url)}`);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-32">
        {/* Futuristic Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10" />
          
          <div className="container px-4">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mx-auto"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Next-Gen Business Intelligence
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-heading font-bold"
              >
                Build. Audit. <span className="text-primary italic">Grow.</span><br />
                Everything with <span className="text-glow">WebOS</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed"
              >
                Transform your business with our AI-powered growth engine. Get deep audits, 
                high-conversion landing pages, and real-time performance tracking in one elegant platform.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-xl mx-auto"
              >
                <form onSubmit={handleAudit} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative flex p-1.5 rounded-full glass items-center gap-2 border-white/10">
                    <div className="pl-4 flex items-center gap-2 text-muted-foreground shrink-0 border-r border-white/5 pr-4 hidden sm:flex">
                      <Globe className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">https://</span>
                    </div>
                    <Input 
                      placeholder="Enter your website URL" 
                      className="border-none bg-transparent focus-visible:ring-0 text-foreground h-12 shadow-none placeholder:text-muted-foreground/50"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <Button type="submit" className="rounded-full px-8 h-12 bg-primary hover:bg-primary/80 transition-all gap-2 shadow-xl shadow-primary/20">
                      Audit
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
                <p className="mt-4 text-xs text-muted-foreground">No credit card required • Instant AI Analysis</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="py-24">
          <div className="container px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-heading font-bold">The Core Engine</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Precision tools designed to accelerate your digital growth through advanced heuristics and AI.</p>
            </div>

            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-6 md:grid-rows-2 h-auto"
            >
              <motion.div variants={item} className="md:col-span-3 glass rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:border-primary/30 transition-all">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold">AI Page Generator</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">Describe your business and watch WebOS craft a high-converting landing page in seconds, optimized for your specific niche.</p>
                </div>
                <div className="mt-8 aspect-video glass-dark rounded-xl border border-white/5 p-4 overflow-hidden relative">
                   <div className="absolute top-4 left-4 flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500/50" />
                      <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                      <div className="h-2 w-2 rounded-full bg-green-500/50" />
                   </div>
                   <div className="mt-6 space-y-2 opacity-50">
                      <div className="h-4 w-3/4 bg-white/5 rounded" />
                      <div className="h-4 w-1/2 bg-white/5 rounded" />
                   </div>
                </div>
              </motion.div>

              <motion.div variants={item} className="md:col-span-3 glass rounded-3xl p-8 group cursor-pointer hover:border-primary/30 transition-all">
                 <div className="h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-heading font-bold">Deep Audit Dashboard</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">Our 7-layer scanning engine analyzes everything from core web vitals to semantic SEO and conversion heuristics.</p>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                       <div className="glass-dark p-4 rounded-2xl">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">SEO</div>
                          <div className="text-2xl font-bold text-primary">98%</div>
                       </div>
                       <div className="glass-dark p-4 rounded-2xl">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">UX</div>
                          <div className="text-2xl font-bold text-accent">84%</div>
                       </div>
                    </div>
                 </div>
              </motion.div>

              <motion.div variants={item} className="md:col-span-2 glass rounded-3xl p-8 group cursor-pointer hover:border-primary/30 transition-all">
                <div className="space-y-4">
                  <Layers className="h-8 w-8 text-primary/60" />
                  <h3 className="text-xl font-heading font-bold">Bento Layouts</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">Modern design patterns that make your content pop and convert.</p>
                </div>
              </motion.div>

              <motion.div variants={item} className="md:col-span-2 glass rounded-3xl p-8 group cursor-pointer hover:border-primary/30 transition-all">
                <div className="space-y-4">
                  <Shield className="h-8 w-8 text-accent/60" />
                  <h3 className="text-xl font-heading font-bold">Secure Hosting</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">Enterprise-grade security on the edge for every page you build.</p>
                </div>
              </motion.div>

              <motion.div variants={item} className="md:col-span-2 glass rounded-3xl p-8 group cursor-pointer hover:border-primary/30 transition-all">
                <div className="space-y-4">
                  <Smartphone className="h-8 w-8 text-white/40" />
                  <h3 className="text-xl font-heading font-bold">Mobile First</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">Pixel-perfect responsiveness across all devices and resolutions.</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container px-4 text-center">
            <div className="glass rounded-[40px] py-20 px-8 relative overflow-hidden">
               <div className="absolute inset-0 bg-primary/5 -z-10" />
               <div className="max-w-2xl mx-auto space-y-8">
                  <h2 className="text-4xl md:text-5xl font-heading font-bold">Ready to outgrow the competition?</h2>
                  <p className="text-muted-foreground text-lg">Join 2,000+ businesses using WebOS to dominate their market with AI-powered agility.</p>
                  <Button size="lg" className="rounded-full px-12 h-14 bg-white text-black hover:bg-white/90 shadow-2xl transition-all font-bold">
                    Launch Your Engine
                  </Button>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5">
        <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold text-glow">WebOS</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
             <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
             <Link href="#" className="hover:text-primary transition-colors">GitHub</Link>
             <Link href="#" className="hover:text-primary transition-colors">Docs</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 WebOS Business Growth Engine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
