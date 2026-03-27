"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { runAuditAction } from "./actions";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Activity,
  Cpu,
  Fingerprint,
  Zap,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Globe
} from "lucide-react";

function AuditContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "your-website.com";
  
  const [stage, setStage] = useState<"loading" | "report">("loading");
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("Initializing neural link...");
  const [auditData, setAuditData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const tasks = [
    "Neural SEO metadata scan...",
    "Bento performance heuristics...",
    "Quantum mobile responsiveness...",
    "Blockchain security audit...",
    "Accessibility matrix check...",
    "User experience synaptic analysis...",
    "Synthesizing growth report..."
  ];

  useEffect(() => {
    let isMounted = true;

    async function startAudit() {
      // Simulate progress while waiting for real results
      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + (90 - prev) * 0.1 : prev));
        const taskIndex = Math.min(Math.floor((progress / 100) * tasks.length), tasks.length - 1);
        setCurrentTask(tasks[taskIndex]);
      }, 1000);

      try {
        const result = await runAuditAction(url);
        if (isMounted) {
          if (result.success) {
            setAuditData(result);
            setProgress(100);
            setCurrentTask("Synthesis Complete.");
            setTimeout(() => setStage("report"), 1000);
          } else {
            setError(result.error);
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Connection to matrix lost.");
      } finally {
        clearInterval(progressInterval);
      }
    }

    startAudit();
    return () => { isMounted = false; };
  }, [url]);

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center p-6 mt-20">
        <div className="max-w-md glass-card border-red-500/20 text-center space-y-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-heading font-bold italic">Neural Decoupling</h2>
          <p className="text-muted-foreground text-sm font-body">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full border-white/10 hover:bg-white/5">
            Reset Matrix
          </Button>
        </div>
      </main>
    );
  }

  if (stage === "loading") {
    return (
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden mt-20">
        <div className="max-w-md w-full space-y-12 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-[-20px] rounded-full bg-primary/20 blur-3xl animate-pulse" />
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="relative h-32 w-32 rounded-full border-2 border-primary/30 flex items-center justify-center mx-auto"
            >
              <Cpu className="h-12 w-12 text-primary" />
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
            </motion.div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-heading font-bold tracking-tight italic">Scanning <span className="text-primary">{url}</span></h2>
              <p className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">{currentTask}</p>
            </div>
            <div className="glass rounded-full p-1 border-white/5 overflow-hidden h-3">
               <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
               />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">{Math.round(progress)}% Complete</p>
          </div>
        </div>
      </main>
    );
  }

  const scores = auditData?.metrics || { performance: 84, seo: 92, accessibility: 100, bestPractices: 85 };

  return (
    <main className="flex-1 pb-32 pt-32">
      <div className="container px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 space-y-6"
        >
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <Globe className="h-4 w-4" />
            Matrix Analysis for {url}
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-9xl font-heading font-bold italic tracking-tighter">Score: <span className="text-glow-soft text-primary">{Math.round(scores.performance)}</span></h1>
              <p className="text-muted-foreground max-w-lg mx-auto font-body">The future of high-performance interfaces starts here. Neural components synthesized for distributed edge protocols.</p>
            </div>
            <Button size="lg" className="rounded-full px-10 h-16 bg-primary hover:bg-primary/80 text-white shadow-2xl shadow-primary/30 group font-bold uppercase tracking-widest text-xs">
              Fix Decouplings
              <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { label: "Performance", score: scores.performance, status: scores.performance > 90 ? "Optimal" : "Leakage", icon: Zap, color: "text-orange-500" },
            { label: "SEO", score: scores.seo, status: scores.seo > 90 ? "Stable" : "Fix Required", icon: Fingerprint, color: "text-accent" },
            { label: "Security", score: scores.bestPractices, status: "Encrypted", icon: ShieldCheck, color: "text-green-500" },
            { label: "UX Synapse", score: scores.accessibility, status: "Fluid", icon: Activity, color: "text-primary" }
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              key={i}
              transition={{ delay: i * 0.1 }}
            >
              <div className="glass-card hover:border-primary/30 transition-colors p-8">
                <div className="flex items-center justify-between mb-6">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${stat.color}`}>{stat.status}</span>
                </div>
                <div className="text-5xl font-heading font-bold">{Math.round(stat.score)}</div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] mt-2">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <h3 className="font-heading italic text-3xl font-bold underline decoration-primary/20 decoration-4 underline-offset-8 mb-8">System Decouplings</h3>
            <div className="space-y-4">
              {[
                {
                  title: "Asset Hydration Lag",
                  desc: "Delayed first meaningful paint is causing user friction. Immediate optimization suggested.",
                  impact: "High",
                  icon: AlertCircle
                },
                {
                  title: "Fragmented Meta Vectors",
                  desc: "Semantic disconnect detected in core keywords. Affecting neural discovery.",
                  impact: "Medium",
                  icon: Activity
                }
              ].map((rec, i) => (
                <div key={i} className="group glass-card p-6 flex items-start justify-between gap-6 cursor-pointer hover:bg-white/5 transition-all">
                  <div className="flex gap-6">
                    <div className={`mt-1 p-3 rounded-2xl ${rec.impact === 'High' ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'}`}>
                      <rec.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="font-heading font-bold text-xl">{rec.title}</h4>
                       <p className="text-sm text-muted-foreground font-body leading-relaxed">{rec.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-muted-foreground/30 group-hover:text-primary transition-colors mt-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-card bg-primary text-primary-foreground border-none relative overflow-hidden p-10 space-y-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="space-y-4 relative z-10">
                <h3 className="text-4xl font-heading font-bold italic">WebOS <span className="text-glow-soft">Matrix</span></h3>
                <p className="text-primary-foreground/70 text-sm font-body italic leading-relaxed">Upgrade to the high-availability neural optimization protocol for distributed remediation.</p>
              </div>
              <ul className="space-y-4 relative z-10">
                {[
                  "Quantum Real-Time Audits",
                  "AI Synaptic Remediator",
                  "Global Edge Shield",
                  "Advanced SEO Vectoring"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                    <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl relative z-10">
                Initiate Upgrade
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AuditPage() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <div className="mesh-gradient" />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-primary mt-20"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
        <AuditContent />
      </Suspense>
    </div>
  );
}
