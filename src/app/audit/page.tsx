"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Search, 
  Settings, 
  ShieldCheck, 
  Smartphone, 
  Zap,
  ArrowRight,
  ChevronRight,
  Globe,
  Activity,
  Cpu,
  Fingerprint
} from "lucide-react";

function AuditContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "your-website.com";
  
  const [stage, setStage] = useState<"loading" | "report">("loading");
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("Initializing neural link...");

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
    if (stage === "loading") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage("report"), 800);
            return 100;
          }
          const next = prev + Math.random() * 8;
          const taskIndex = Math.floor((next / 100) * tasks.length);
          setCurrentTask(tasks[Math.min(taskIndex, tasks.length - 1)]);
          return next;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [stage]);

  if (stage === "loading") {
    return (
      <main className="flex-1 flex items-center justify-center p-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="max-w-md w-full space-y-12 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-[-20px] rounded-full bg-primary/20 blur-3xl animate-pulse" />
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="relative h-32 w-32 rounded-full border-2 border-primary/30 flex items-center justify-center mx-auto"
            >
              <Cpu className="h-12 w-12 text-primary text-glow" />
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
            </motion.div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-heading font-bold tracking-tight">Scanning {url}</h2>
              <p className="text-primary text-xs font-bold uppercase tracking-widest animate-pulse">{currentTask}</p>
            </div>
            <div className="glass rounded-full p-1 border-white/5 overflow-hidden">
               <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
               />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">{Math.round(progress)}% Matrix Complete</p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-2 text-left"
          >
            {tasks.map((task, i) => {
              const isActive = tasks.indexOf(currentTask) === i;
              const isDone = tasks.indexOf(currentTask) > i;
              return (
                <div key={i} className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-all ${isActive ? 'glass border-primary/20' : ''}`}>
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                  ) : isActive ? (
                    <Activity className="h-4 w-4 text-primary animate-pulse shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-white/10 shrink-0" />
                  )}
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${isDone ? "text-foreground" : isActive ? "text-primary" : "text-muted-foreground opacity-30"}`}>
                    {task}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pb-32 pt-24">
      <div className="container px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 space-y-4"
        >
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Globe className="h-4 w-4" />
            Analysis for {url}
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-heading font-bold italic">Score: <span className="text-glow text-primary">84</span></h1>
              <p className="text-muted-foreground max-w-xl font-body leading-relaxed">System scan complete. Your digital footprint is stable, but multiple growth nodes are underperforming.</p>
            </div>
            <Button size="lg" className="rounded-full px-8 h-14 bg-primary hover:bg-primary/80 text-white shadow-2xl shadow-primary/30 group">
              Fix Growth Nodes
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Neural SEO", score: "92", status: "Optimal", icon: Fingerprint, color: "text-accent" },
            { label: "Performance", score: "68", status: "Leakage", icon: Zap, color: "text-orange-500" },
            { label: "Security", score: "100", status: "Encrypted", icon: ShieldCheck, color: "text-green-500" },
            { label: "Synaptic UX", score: "85", status: "Fluid", icon: Activity, color: "text-primary" }
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={i}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass border-white/5 hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${stat.color}`}>{stat.status}</span>
                  </div>
                  <div className="text-4xl font-heading font-bold">{stat.score}</div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 glass border-white/5">
            <CardHeader>
              <CardTitle className="font-heading italic text-2xl">Critical Decouplings</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">High-impact remediation required</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Asset Hydration Lag",
                  desc: "Delayed FCP is causing 14% bounce rate. Immediate optimization suggested.",
                  impact: "High",
                  icon: AlertCircle
                },
                {
                  title: "Fragmented Meta Vectors",
                  desc: "Semantic disconnect detected in 3 core pages. Affecting discovery index.",
                  impact: "Medium",
                  icon: Activity
                },
                {
                  title: "CTA Contrast Violation",
                  desc: "Primary pathways lack visual priority. Synthetic heatmap shows low engagement.",
                  impact: "High",
                  icon: Zap
                }
              ].map((rec, i) => (
                <div key={i} className="group p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-start justify-between gap-6 cursor-pointer">
                  <div className="flex gap-4">
                    <div className={`mt-1 p-2 rounded-lg ${rec.impact === 'High' ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'}`}>
                      <rec.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-heading font-bold text-lg">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground font-body">{rec.desc}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="group-hover:translate-x-2 transition-transform">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="bg-primary text-primary-foreground border-none shadow-[0_0_50px_rgba(59,130,246,0.2)] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <CardContent className="p-8 space-y-8 relative">
                <div className="space-y-2">
                  <h3 className="text-3xl font-heading font-bold italic">WebOS <span className="text-glow">Pro</span></h3>
                  <p className="text-primary-foreground/70 text-sm font-body">Activate the neural optimization network.</p>
                </div>
                <ul className="space-y-4">
                  {[
                    "Quantum Deep Audits",
                    "AI Synaptic Builder",
                    "Edge Protocol Hosting",
                    "Priority Growth Core"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold tracking-tight">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-full font-bold shadow-xl">
                  Upgrade Matrix
                </Button>
              </CardContent>
            </Card>

            <div className="glass rounded-[32px] overflow-hidden border-white/5 group h-auto">
               <div className="aspect-[16/10] bg-black/40 flex items-center justify-center p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                  <Settings className="h-12 w-12 text-primary/30 animate-spin-slow group-hover:scale-110 transition-transform" />
               </div>
               <div className="p-8 space-y-4">
                  <h4 className="font-heading font-bold text-xl">Auto-Remediate</h4>
                  <p className="text-xs text-muted-foreground font-body">WebOS can synthesize optimized code for all detected decouplings automatically.</p>
                  <Button variant="outline" className="w-full rounded-full border-white/10 hover:bg-primary/5 text-primary">
                    Initiate Build
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AuditPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-primary"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
        <AuditContent />
      </Suspense>
    </div>
  );
}
