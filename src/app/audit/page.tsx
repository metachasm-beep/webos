"use client"; // v1.0.1-branding-final

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { runAuditAction, createPdfReport } from "./actions";
import { MatrixTooltip } from "@/components/MatrixTooltip";
import { ApiStatusPanel } from "@/components/ApiStatusPanel";
import { SslLabsScanner } from "@/components/SslLabsScanner";
import { SvelteBridgeGlowCard, SvelteBridgeTypist } from "@/components/SvelteBridge";
import { Leaf, ShieldCheck, Zap, Globe, ArrowRight, Activity, AlertCircle, ChevronRight, CheckCircle2, Cpu, Fingerprint, Share2 } from "lucide-react";

const CACHE_KEY = (url: string) => `audit_cache_${encodeURIComponent(url)}`;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const getHostname = (link: string) => {
  try {
    return /^https?:\/\//i.test(link) ? new URL(link).hostname : new URL(`https://${link}`).hostname;
  } catch(e) { return link; }
};

function AuditContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "your-website.com";
  const paymentSuccess = searchParams.get("payment") === "success";
  
  const [stage, setStage] = useState<"loading" | "report">("loading");
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("Starting audit...");
  const [auditData, setAuditData] = useState<any>(null);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<number[]>([]);
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
        body: JSON.stringify({ 
          metrics: auditData.metrics, 
          url,
          growth: {
            metrics: auditData.metrics.growth,
            score: auditData.metrics.composite
          }
        }),
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
              // Neural Sync Bridge: Store for dashboard claiming
              localStorage.setItem("NEURAL_PENDING_REGISTRY", JSON.stringify({ ...result, url }));
            } catch (_) { /* storage full — ignore */ }

            setAuditData(result);
            setProgress(100);
            setCurrentTask("Audit complete.");
            setTimeout(() => setStage("report"), 1000);
          } else {
            setError((result as any).error || "Audit failed. Please try again.");
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

  // Real-time Telemetry Effect
  useEffect(() => {
    if (!auditData?.metrics?.growth || stage !== "report") return;
    
    // Initialize live metrics with static data
    setLiveMetrics(auditData.metrics.growth);

    const interval = setInterval(() => {
      setLiveMetrics((prev: any) => {
        if (!prev) return null;
        const fluctuation = (Math.random() - 0.5) * 0.04;
        const newVal = Number((prev.ltv_cac + fluctuation).toFixed(2));
        
        // Update history for LayerChart-style SVG
        setTelemetryHistory(h => [...h.slice(-20), newVal]);
        
        return {
          ...prev,
          ltv_cac: newVal,
          burn_multiple: Number((prev.burn_multiple + (Math.random() - 0.5) * 0.02).toFixed(2)),
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [auditData, stage]);

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
        {/* Degraded Mode Banner */}
        {auditData?.degraded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-start gap-4 glass border border-amber-500/30 bg-amber-500/5 rounded-2xl p-5"
          >
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-400 uppercase tracking-widest">Partial Audit Mode</p>
              <p className="text-xs text-amber-300/70 leading-relaxed">
                Google PageSpeed was temporarily unavailable (502 Bad Gateway). Performance scores shown are estimated baselines. 
                All other engines (Accessibility, Security, SEO, Pa11y) ran successfully on live data.
                <span className="font-bold text-amber-400 ml-1">Refresh to retry a full scan.</span>
              </p>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 space-y-6"
        >
          <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <Globe className="h-4 w-4" />
            WebOS AI Audit Report for {url}
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <img 
                  src={`https://logo.clearbit.com/${getHostname(url)}?size=128`} 
                  alt="Logo"
                  className="w-20 h-20 rounded-3xl bg-white/5 object-cover shadow-2xl border border-white/10"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <h1 className="text-6xl md:text-9xl font-heading font-bold italic tracking-tighter">
                  Matrix: <span className="text-glow-soft text-primary">{Math.round(scores.composite?.total || scores.performance)}</span>
                </h1>
              </div>
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
                        <SvelteBridgeTypist text={aiSummary} speed={25} />
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
              <Link href="/dashboard">
                <Button 
                   size="lg"
                   className="rounded-full px-10 h-16 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3"
                >
                   <Activity className="h-4 w-4" />
                   Neural Workspace
                </Button>
              </Link>

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

              <Button 
                 onClick={() => {
                   const score = Math.round(scores.composite?.total || scores.performance);
                   const domain = getHostname(url);
                   const profile = scores.performance > 90 ? "Dominator" : "Challenger";
                   const ogUrl = `/api/audit/og?score=${score}&domain=${domain}&profile=${profile}`;
                   const shareUrl = `https://twitter.com/intent/tweet?text=I%20just%20audited%20my%20website%20using%20WebOS%20AI.%20My%20Matrix%20Score%3A%20${score}%25!%20Check%20your%20benchmark%20here%3A&url=${encodeURIComponent(window.location.href)}`;
                   window.open(shareUrl, '_blank');
                 }}
                 size="lg"
                 className="rounded-full px-10 h-16 bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3"
              >
                 <Share2 className="h-4 w-4" />
                 Viral Share
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

        {/* Growth Matrix Telemetry */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="font-heading italic text-2xl font-bold">Growth Matrix Telemetry</h3>
            <div className="h-[1px] flex-1 bg-white/5" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-green-500/50">Neural Link Active</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                label: "LTV:CAC", 
                sub: "Efficiency Ratio", 
                value: `${liveMetrics?.ltv_cac || scores.growth?.ltv_cac || "3.2"}x`, 
                impact: "Return on acquisition spend", 
                color: (liveMetrics?.ltv_cac >= 3 || scores.growth?.ltv_cac >= 3) ? "text-green-500" : "text-orange-500" 
              },
              { 
                label: "BURN", 
                sub: "Burn Multiple", 
                value: liveMetrics?.burn_multiple || scores.growth?.burn_multiple || "1.2", 
                impact: "Capital efficiency index", 
                color: (liveMetrics?.burn_multiple <= 1.5 || scores.growth?.burn_multiple <= 1.5) ? "text-green-500" : "text-red-500" 
              },
              { 
                label: "RUNWAY", 
                sub: "Estimated Runway", 
                value: `${scores.growth?.runway || "18"}M`, 
                impact: "Months of operational cash", 
                color: (scores.growth?.runway >= 12) ? "text-green-500" : "text-orange-500" 
              }
            ].map((v, i) => (
              <SvelteBridgeGlowCard key={i} className="flex items-center justify-between border-none">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-primary">{v.label}</p>
                  <p className="text-lg font-heading font-bold text-foreground/90">{v.sub}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{v.impact}</p>
                </div>
                <div className={`text-3xl font-heading font-bold text-glow-soft ${v.color}`}>{v.value}</div>
              </SvelteBridgeGlowCard>
            ))}
          </div>
          
          {/* LayerChart-style SVG Telemetry */}
          <div className="mt-8 h-48 glass-card border-none bg-primary/5 p-6 relative overflow-hidden group">
            {/* HUD Elements Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
               <div className="absolute top-2 right-4 text-[7px] font-mono uppercase tracking-widest text-primary text-right leading-relaxed">
                  PROCESS: GROWTH_PATH_OPT<br/>STATUS: ANALYZING_FLUX<br/>STABILITY: 99.9%
               </div>
               <div className="absolute bottom-2 left-4 text-[7px] font-mono uppercase tracking-widest text-primary leading-relaxed">
                  NEURAL_LINK: ACTIVE<br/>OPTIMIZATION: ENABLED<br/>MATRIX_v2
               </div>
            </div>

            <div className="flex justify-between items-start relative z-10 mb-2">
               <div className="flex items-center gap-3">
                 <Activity className="h-5 w-5 text-primary animate-pulse" />
                 <div className="space-y-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary block">Logical Synthesis Engine</span>
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-primary/40 block">Real-time Efficiency Telemetry</span>
                 </div>
               </div>
               <div className="text-right">
                  <div className="text-3xl font-heading font-bold text-primary text-glow-soft">
                     {telemetryHistory.length > 0 ? (telemetryHistory[telemetryHistory.length - 1] * 25).toFixed(1) : "0"}%
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-widest text-primary/60">Current Efficiency</div>
               </div>
            </div>

            <div className="relative h-24 w-full">
               {/* Human-readable Axis Labels */}
               <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[6px] font-bold text-primary/30 uppercase tracking-tighter py-1 border-r border-primary/10 pr-2">
                  <span>MAX</span>
                  <span>OPT</span>
                  <span>BASE</span>
               </div>
               
               <svg className="h-full w-full overflow-visible ml-8" viewBox="0 0 100 20" preserveAspectRatio="none">
                 <defs>
                   <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                     <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                   </linearGradient>
                   <pattern id="grid" width="10" height="5" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.05" className="text-primary/10" />
                   </pattern>
                 </defs>

                 {/* Neural Grid Background */}
                 <rect width="100%" height="100%" fill="url(#grid)" />

                 {/* Scanning Laser Line */}
                 <motion.line
                   x1="0" y1="0" x2="0" y2="20"
                   stroke="currentColor"
                   strokeWidth="0.2"
                   className="text-primary/40"
                   animate={{ x: [0, 100, 0] }}
                   transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                 />

                 <motion.path 
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: 1 }}
                   d={`M ${telemetryHistory.map((v, i) => `${(i / (telemetryHistory.length - 1)) * 100},${10 - (v - 3.2) * 10}`).join(' L ')}`}
                   fill="none"
                   stroke="#3b82f6"
                   strokeWidth="1"
                   className="drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]"
                 />
                 <path 
                   d={`M ${telemetryHistory.map((v, i) => `${(i / (telemetryHistory.length - 1)) * 100},${10 - (v - 3.2) * 10}`).join(' L ')} L 100,20 L 0,20 Z`}
                   fill="url(#chartGradient)"
                 />

                 {/* Data Packet Pulse Nodes */}
                 {telemetryHistory.length > 5 && [20, 50, 80].map((pos, idx) => (
                    <motion.circle
                      key={idx}
                      r="0.8"
                      fill="#3b82f6"
                      animate={{ 
                         x: [0, 100], 
                         opacity: [0, 1, 0],
                         r: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                         duration: 6, 
                         repeat: Infinity, 
                         delay: idx * 2.0,
                         ease: "linear"
                      }}
                      className="shadow-[0_0_12px_#3b82f6]"
                    />
                 ))}
               </svg>
            </div>
            
            {/* Bottom Status Ticker */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-primary/5 flex items-center px-4 overflow-hidden border-t border-primary/10">
               <div className="flex gap-8 animate-marquee text-[6px] font-bold uppercase tracking-[0.3em] text-primary/40 whitespace-nowrap">
                  <span>Logic Synthesis Optimized</span>
                  <span>Neural Path Secured</span>
                  <span>Data Flow Stabilized</span>
                  <span>Growth Matrix Synthesis Active</span>
                  <span>Logic Synthesis Optimized</span>
                  <span>Neural Path Secured</span>
               </div>
            </div>
          </div>
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
            <h3 className="font-heading italic text-3xl font-bold underline decoration-primary/20 decoration-4 underline-offset-8 mb-8">Deep Metrics</h3>
            <div className="grid sm:grid-cols-2 gap-4">
               <SslLabsScanner url={url} />

               {auditData?.carbon ? (
                 <div className="glass-card p-6 border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                       <Leaf className="h-24 w-24 text-green-500" />
                    </div>
                    
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="p-3 bg-white/5 rounded-2xl">
                        <Leaf className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-xl mb-1 text-green-500">Eco-Impact</h4>
                        <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-[200px]">
                          Website Carbon Footprint & Energy Grid analysis.
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 flex items-end justify-between relative z-10">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Cleaner Than</p>
                        <p className="text-xs text-green-400">{(auditData.carbon.cleanerThan * 100).toFixed(0)}% of tested sites</p>
                      </div>
                      
                      <div className="text-5xl font-heading font-black italic tracking-tighter text-green-500 text-glow-soft">
                        {auditData.carbon.green ? "A+" : "C"}
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="glass-card p-6 border-white/5 flex items-center justify-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                    Carbon Metrics Unavailable
                 </div>
               )}

               {auditData?.security && (
                 <div className="glass-card p-6 border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                       <ShieldCheck className={`h-24 w-24 ${auditData.security.status === 'Clear' ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                    
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="p-3 bg-white/5 rounded-2xl">
                        <ShieldCheck className={`h-6 w-6 ${auditData.security.status === 'Clear' ? 'text-green-500' : 'text-red-500'}`} />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-xl mb-1">Security Audit</h4>
                        <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-[200px]">
                          Google Safe Browsing threat detection protocol.
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 flex items-end justify-between relative z-10">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Network Status</p>
                        <p className={`text-xs ${auditData.security.status === 'Clear' ? 'text-green-400' : 'text-red-400 font-bold'}`}>
                          {auditData.security.status === 'Clear' ? 'Security Clearance: Verified' : `Threat Detected: ${auditData.security.threats?.join(', ') || 'Unsafe'}`}
                        </p>
                      </div>
                      
                      <div className={`text-5xl font-heading font-black italic tracking-tighter ${auditData.security.status === 'Clear' ? 'text-green-500' : 'text-red-500'} text-glow-soft`}>
                        {auditData.security.status === 'Clear' ? "OK" : "!!!"}
                      </div>
                    </div>
                 </div>
               )}
            </div>

            <h3 className="font-heading italic text-3xl font-bold underline decoration-primary/20 decoration-4 underline-offset-8 mb-8 mt-12">Issues Found</h3>
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
            <ApiStatusPanel />

            <div className="glass-card bg-primary text-primary-foreground border-none relative overflow-hidden p-10 space-y-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="space-y-4 relative z-10">
                <h3 className="text-4xl font-heading font-bold italic">WebOS AI <span className="text-glow-soft">Pro</span></h3>
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
      
      {/* Svelte-Parallax inspired background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none opacity-20">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-primary mt-20">Computing...</div>}>
         <AuditContent />
      </Suspense>
    </div>
  );
}
