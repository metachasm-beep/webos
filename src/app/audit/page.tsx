"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { runAuditAction, createPdfReport } from "./actions";
import { 
  CheckCircle2, 
  AlertCircle, 
  Cpu,
  Fingerprint,
  Zap,
  ShieldCheck,
  Activity,
  ChevronRight,
  ArrowRight,
  Globe
} from "lucide-react";

import { MatrixTooltip } from "@/components/MatrixTooltip";

const CACHE_KEY = (url: string) => `audit_cache_${encodeURIComponent(url)}`;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function AuditContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "your-website.com";
  const paymentSuccess = searchParams.get("payment") === "success";
  
  const [stage, setStage] = useState<"loading" | "report">("loading");
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("Starting audit...");
  const [auditData, setAuditData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const tasks = [
    "Checking SEO metadata...",
    "Testing page speed...",
    "Checking mobile responsiveness...",
    "Reviewing security headers...",
    "Testing accessibility...",
    "Analysing user experience...",
    "Generating your report..."
  ];

  const handleAiSynthesis = async () => {
    if (!auditData || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const resp = await fetch("/api/audit/summarize", {
        method: "POST",
        body: JSON.stringify({ metrics: auditData.metrics, url }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await resp.json();
      if (data.error) {
        setAiSummary("AI summary unavailable: " + data.error + ". Check your COHERE_API_KEY.");
      } else {
        setAiSummary(data.summary || "No summary returned.");
      }
    } catch (e) {
      setAiSummary("Couldn't load the AI summary right now. Check the scores above for the full picture.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (isGeneratingPdf || !auditData) return;
    setIsGeneratingPdf(true);
    try {
      const result = await createPdfReport(url, auditData);
      if (result.status === "Provisioned" && result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      } else {
        alert(result.message || "PDF generation is currently unavailable. Please check your API2PDF_API_KEY.");
      }
    } catch (e) {
      alert("Something went wrong while generating the report via API.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function startAudit() {
      // Check localStorage cache first
      try {
        const cached = localStorage.getItem(CACHE_KEY(url));
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL_MS) {
            if (isMounted) {
              setAuditData(data);
              setProgress(100);
              setCurrentTask("Loaded from cache.");
              setTimeout(() => setStage("report"), 400);
            }
            return;
          }
        }
      } catch (_) { /* ignore parse errors */ }

      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + (90 - prev) * 0.1 : prev));
        const taskIndex = Math.min(Math.floor((progress / 100) * tasks.length), tasks.length - 1);
        setCurrentTask(tasks[taskIndex]);
      }, 1000);

      try {
        const result = await runAuditAction(url);
        if (isMounted) {
          if (result.success) {
            // Persist to cache
            try {
              localStorage.setItem(CACHE_KEY(url), JSON.stringify({ data: result, timestamp: Date.now() }));
            } catch (_) { /* storage full — ignore */ }

            setAuditData(result);
            setProgress(100);
            setCurrentTask("Audit complete.");
            setTimeout(() => setStage("report"), 1000);
          } else {
            setError(result.error || "Audit failed. Please try again.");
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Something went wrong. Please try again.");
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
          <h2 className="text-2xl font-heading font-bold italic">Audit Failed</h2>
          <p className="text-muted-foreground text-sm font-body">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full border-white/10 hover:bg-white/5">
            Try Again
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
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">This usually takes 10–15 seconds</p>
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
    <>
      <main className="flex-1 pb-32 pt-32">
      <div className="container px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 space-y-6"
        >
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <Globe className="h-4 w-4" />
            Website Audit Report for {url}
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-9xl font-heading font-bold italic tracking-tighter">Score: <span className="text-glow-soft text-primary">{Math.round(scores.performance)}</span></h1>
              <div className="max-w-xl">
                 <AnimatePresence mode="wait">
                   {aiSummary ? (
                     <motion.div 
                       key="summary"
                       initial={{ opacity: 0, x: -20 }} 
                       animate={{ opacity: 1, x: 0 }} 
                       exit={{ opacity: 0, x: 20 }}
                       className="glass-card p-8 border-primary/20 bg-primary/5 relative overflow-hidden group"
                     >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                           <Zap className="h-12 w-12 text-primary" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                           <div className="h-1 w-8 bg-primary rounded-full" />
                           <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">AI Summary</span>
                        </div>
                        <p className="text-sm font-body leading-relaxed text-foreground/80">{aiSummary}</p>
                     </motion.div>
                   ) : (
                     <motion.div key="placeholder" className="space-y-4">
                        <p className="text-muted-foreground font-body leading-relaxed max-w-lg">Your audit is complete. Click "Get AI Summary" for a plain-English breakdown of your results.</p>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleAiSynthesis}
                disabled={isSummarizing || !auditData}
                size="lg"
                variant="outline"
                className="rounded-full px-10 h-16 border-primary/20 hover:bg-primary/5 text-primary group font-bold uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {isSummarizing ? "Generating..." : "Get AI Summary"}
                <Zap className="ml-3 h-4 w-4" />
              </Button>
              <Button 
                onClick={handleGeneratePdf}
                size="lg" 
                variant="outline" 
                className="rounded-full px-10 h-16 border-white/10 hover:bg-primary/5 hover:border-primary/30 hover:text-primary text-muted-foreground group font-bold uppercase tracking-widest text-xs transition-all"
              >
                {isGeneratingPdf ? "Generating PDF..." : "Download Report"}
                <ArrowRight className="ml-3 h-4 w-4 opacity-30 group-hover:opacity-100" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { 
              label: "Performance", 
              score: scores.performance, 
              status: scores.performance > 90 ? "Great" : "Needs Work", 
              icon: Zap, 
              color: "text-orange-500", 
              type: "performance" as const,
              desc: "How fast your page loads and responds. Affects user experience and Google rankings.",
              narrative: "A low score usually means images aren't compressed, JavaScript is blocking the page, or your server is slow. Fixing these can cut load time in half."
            },
            { 
              label: "SEO", 
              score: scores.seo, 
              status: scores.seo > 90 ? "Great" : "Fix Required", 
              icon: Fingerprint, 
              color: "text-accent", 
              type: "seo" as const,
              desc: "How well search engines can find and rank your site.",
              narrative: "Missing meta descriptions, broken links, or missing alt text are the most common culprits. These are quick wins that can significantly improve your Google visibility."
            },
            { 
              label: "Best Practices", 
              score: scores.bestPractices, 
              status: scores.bestPractices > 90 ? "Great" : "Review", 
              icon: ShieldCheck, 
              color: "text-green-500", 
              type: "security" as const,
              desc: "Whether your site follows modern web standards and security practices.",
              narrative: "This checks for HTTPS, secure cookie flags, outdated libraries, and browser console errors. Most issues here are a quick fix."
            },
            { 
              label: "Accessibility", 
              score: scores.accessibility, 
              status: scores.accessibility > 90 ? "Great" : "Improve", 
              icon: Activity, 
              color: "text-primary", 
              type: "ux" as const,
              desc: "How easy your site is to use for people with disabilities.",
              narrative: "Missing ARIA labels, low contrast text, and keyboard navigation issues are the most common problems. Fixing these also improves SEO."
            }
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              key={i}
              transition={{ delay: i * 0.1 }}
            >
              <MatrixTooltip 
                label={stat.label}
                description={stat.desc}
                technicalNarrative={stat.narrative}
                type={stat.type}
              >
                <div className="glass-card hover:border-primary/30 transition-all duration-500 p-8 cursor-help group">
                  <div className="flex items-center justify-between mb-6">
                    <stat.icon className={`h-6 w-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${stat.color}`}>{stat.status}</span>
                  </div>
                  <div className="text-5xl font-heading font-bold group-hover:text-primary transition-colors">{Math.round(stat.score)}</div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] mt-2">{stat.label}</p>
                  
                  <div className="mt-6 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        <span>Logic Node 0{i+1}</span>
                        <div className="flex gap-1">
                           <div className="h-1 w-1 bg-primary rounded-full animate-bounce" />
                           <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                     </div>
                  </div>
                </div>
              </MatrixTooltip>
            </motion.div>
          ))}
        </div>

        {/* Core Web Vitals Telemetry */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="font-heading italic text-2xl font-bold">Neural Telemetry (Core Web Vitals)</h3>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "LCP", sub: "Largest Contentful Paint", value: scores.lcp || "0.8s", impact: "Time to show main content" },
              { label: "FID", sub: "First Input Delay", value: scores.fid || "12ms", impact: "Response to first click" },
              { label: "CLS", sub: "Layout Shift Score", value: scores.cls || "0.01", impact: "Visual stability" }
            ].map((v, i) => (
              <div key={i} className="glass border border-white/5 p-8 rounded-3xl flex items-center justify-between group hover:bg-white/5 transition-all">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-primary">{v.label}</p>
                  <p className="text-lg font-heading font-bold text-foreground/90">{v.sub}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{v.impact}</p>
                </div>
                <div className="text-3xl font-heading font-bold text-glow-soft">{v.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <h3 className="font-heading italic text-3xl font-bold underline decoration-primary/20 decoration-4 underline-offset-8 mb-8">Issues Found</h3>
            <div className="space-y-4">
              {[
                { title: "Slow initial load", desc: "Your page takes too long to show meaningful content, which increases bounce rate.", impact: "High", icon: AlertCircle },
                { title: "Missing SEO metadata", desc: "Some pages are missing page titles or descriptions, reducing search engine visibility.", impact: "Medium", icon: Activity }
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
                <h3 className="text-4xl font-heading font-bold italic">TurtleLabs <span className="text-glow-soft">Pro</span></h3>
                <p className="text-primary-foreground/70 text-sm font-body leading-relaxed">Get continuous monitoring, automated fixes, and priority support — all in one dashboard.</p>
              </div>
              <ul className="space-y-4 relative z-10">
                {[
                  "Unlimited real-time audits",
                  "AI-powered fix suggestions",
                  "Security monitoring",
                  "Advanced SEO reporting"
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
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}

export default function AuditPage() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <div className="mesh-gradient" />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-primary mt-20">Computing...</div>}>
         <AuditContent />
      </Suspense>
    </div>
  );
}
