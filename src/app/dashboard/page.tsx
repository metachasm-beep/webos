"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Layout, 
  Activity, 
  ExternalLink, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Search
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Squares from "@/components/reactbits/Squares";
import ShinyText from "@/components/reactbits/ShinyText";

function DashboardContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'audits'>('projects');
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  const scanLocalRegistry = () => {
    const localItems: any[] = [];
    try {
      // 1. Check Neural Pending Registry
      const pending = localStorage.getItem("NEURAL_PENDING_REGISTRY");
      if (pending) {
        const data = JSON.parse(pending);
        localItems.push({ ...data, isLocal: true, created_at: data.created_at || new Date().toISOString() });
      }

      // 2. Scan all audit_cache_* items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("audit_cache_")) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              // Normalize structure
              const result = parsed.data;
              if (result && result.metrics) {
                localItems.push({
                   ...result,
                   url: key.replace("audit_cache_", ""),
                   isLocal: true,
                   created_at: parsed.timestamp ? new Date(parsed.timestamp).toISOString() : new Date().toISOString()
                });
              }
            }
          } catch (e) { /* skip corrupt items */ }
        }
      }
    } catch (_) { /* ignore storage errors */ }
    return localItems;
  };

  const clearLocalRegistry = () => {
    try {
      localStorage.removeItem("NEURAL_PENDING_REGISTRY");
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith("audit_cache_")) {
          localStorage.removeItem(key);
        }
      }
      // Re-fetch to update UI
      fetchData();
    } catch (_) { /* ignore */ }
  };

  const fetchData = async () => {
    const localAudits = scanLocalRegistry();
    
    // If not authenticated, we only show local audits
    if (status !== "authenticated") {
       setAudits(localAudits);
       setIsLoading(false);
       return;
    }

    try {
      const [projectsResp, auditsResp] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/audits")
      ]);
      const pData = await projectsResp.json();
      const cloudAudits = await auditsResp.json();
      
      setProjects(pData.projects || []);
      
      // Smart Merge: Deduplicate by URL, Cloud records take precedence
      const merged = [...cloudAudits];
      localAudits.forEach(local => {
         const exists = merged.some(m => m.url === local.url);
         if (!exists) {
            merged.push(local);
         }
      });

      setAudits(merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setAudits(localAudits); // Fallback to local only on error
    } finally {
      setIsLoading(false);
    }
  };

  const syncPendingRegistry = async () => {
    try {
      const pending = localStorage.getItem("NEURAL_PENDING_REGISTRY");
      if (!pending) return;

      setIsSyncing(true);
      const auditData = JSON.parse(pending);
      
      const resp = await fetch("/api/audits", {
        method: "POST",
        body: JSON.stringify(auditData),
        headers: { "Content-Type": "application/json" }
      });

      if (resp.ok) {
        localStorage.removeItem("NEURAL_PENDING_REGISTRY");
        console.log("Neural Registry Synced successfully.");
      }
    } catch (error) {
      console.warn("Registry Sync skipped.", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && !hasSynced) {
      const initialize = async () => {
        setHasSynced(true);
        await syncPendingRegistry();
        await fetchData();
      };
      initialize();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status, hasSynced]);

  return (
    <div className="min-h-screen bg-black text-white font-body selection:bg-primary/20 overflow-x-hidden">
      <Navbar />

      <div className="fixed inset-0 z-0">
        <Squares 
          direction="diagonal"
          speed={0.3}
          squareSize={40}
          borderColor="rgba(255, 255, 255, 0.02)"
          hoverFillColor="rgba(59, 130, 246, 0.05)"
        />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-8 max-w-7xl mx-auto space-y-16">
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                {isSyncing ? "Neural Syncing Registry..." : "Neural Workspace v.3.1.0"}
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-heading font-bold italic tracking-tighter">Strategic HUD</h1>
            <p className="text-muted-foreground text-sm max-w-md font-body">Orchestrating growth, audits, and neural synthesis across all digital vectors.</p>
          </div>
          
          <div className="flex gap-4">
             <Link href="/#audit-section">
                <Button className="h-16 px-10 rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[11px] gap-3 shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                   <Plus className="h-4 w-4" /> Launch New Audit
                </Button>
             </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Active Project Sequence", value: projects.length, icon: Layers, color: "text-blue-400" },
              { label: "Matrix Audits Completed", value: audits.length, icon: Activity, color: "text-emerald-400" },
              { label: "Strategic Tier", value: audits[0]?.status || "Evaluating", icon: ShieldCheck, color: "text-accent" },
              { label: "Neural Logic Credits", value: "840/1000", icon: Zap, color: "text-orange-400" }
            ].map((stat, i) => (
             <div key={i} className="glass-card p-6 flex flex-col justify-between hover:border-primary/30 transition-all cursor-crosshair group">
                <div className="flex justify-between items-start">
                   <stat.icon className={`h-5 w-5 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                   <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                </div>
                <div className="text-4xl font-heading font-bold mt-4 italic">{stat.value}</div>
             </div>
           ))}
        </div>

        {/* Workspace Management */}
        <div className="space-y-12">
            <div className="flex items-center gap-8 border-b border-white/5">
               <button 
                 onClick={() => setActiveTab('projects')}
                 className={`pb-4 text-[11px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === 'projects' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
               >
                  Project Registry
                  {activeTab === 'projects' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
               </button>
               <button 
                 onClick={() => setActiveTab('audits')}
                 className={`pb-4 text-[11px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === 'audits' ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
               >
                  Audit Archives
                  {activeTab === 'audits' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
               </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'projects' ? (
                <motion.div 
                  key="projects"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-64 rounded-[40px] bg-white/5 animate-pulse" />
                    ))
                  ) : projects.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4">
                       <p className="text-muted-foreground italic">No project sequences found in the registry.</p>
                       <Link href="/builder">
                          <Button variant="outline" className="rounded-full border-white/10 uppercase font-bold tracking-widest text-[10px]">Initialize First Schema</Button>
                       </Link>
                    </div>
                  ) : (
                    projects.map((project, i) => (
                      <Link href={`/builder?id=${project.id}`} key={project.id}>
                        <div className="glass-card h-80 relative overflow-hidden group p-10 flex flex-col justify-between hover:border-primary/50 transition-all">
                           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                              <Layout className="h-32 w-32 rotate-12" />
                           </div>
                           <div className="space-y-4 relative z-10">
                              <div className="flex items-center gap-3">
                                 <div className="h-6 w-6 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <Layers className="h-3 w-3 text-primary" />
                                 </div>
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Synthesized: {new Date(project.updated_at).toLocaleDateString()}</span>
                              </div>
                              <h3 className="text-3xl font-heading font-bold italic">{project.name}</h3>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">{project.nodes?.length || 0} Logic Nodes Detected</p>
                           </div>
                           <div className="relative z-10 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                              Access Sequence <ChevronRight className="h-3 w-3" />
                           </div>
                        </div>
                      </Link>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="audits"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                   {/* Audit Archive Table Placeholder */}
                   <div className="glass-card p-10 space-y-8">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-widest">Growth Matrix History</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input type="text" placeholder="Search archives..." className="bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-2 text-[10px] outline-none focus:border-primary w-40 md:w-64" />
                             </div>
                             <Button 
                                onClick={clearLocalRegistry}
                                variant="ghost" 
                                size="icon"
                                className="rounded-full hover:bg-red-500/10 hover:text-red-400 group"
                                title="Clear Local Cache"
                             >
                                <RefreshCw className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                             </Button>
                         </div>
                      </div>

                      <div className="space-y-4">
                        {audits.length === 0 ? (
                          <div className="py-20 text-center space-y-4">
                             <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mx-auto opacity-20">
                                <Activity className="h-6 w-6" />
                             </div>
                             <div className="text-muted-foreground italic text-[10px]">No historical telemetry found. Initialize an audit to begin registry.</div>
                          </div>
                        ) : (
                          audits.map((audit, i) => (
                             <div key={audit.id || i} className="glass-card p-0 overflow-hidden hover:border-primary/30 transition-all group">
                               <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                                 {/* Domain & Identity */}
                                 <div className="md:col-span-4 p-6 border-r border-white/5 bg-white/[0.02]">
                                   <div className="flex items-center gap-4">
                                     <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                                        {audit.isLocal ? <Clock className="h-5 w-5 opacity-50" /> : <ShieldCheck className="h-5 w-5" />}
                                     </div>
                                     <div className="min-w-0 flex-1 text-left">
                                       <div className="flex items-center gap-2">
                                          <Link href={`/audit?url=${encodeURIComponent(audit.url || "")}`} className="text-sm font-bold truncate max-w-[150px] hover:text-primary transition-colors">
                                            {(() => {
                                              try {
                                                return new URL(audit.url).hostname;
                                              } catch {
                                                return String(audit.url || "Unknown Target");
                                              }
                                            })()}
                                          </Link>
                                          {audit.isLocal ? (
                                             <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-orange-400/10 text-orange-400 font-bold uppercase tracking-tighter border border-orange-400/20">Local</span>
                                          ) : (
                                             <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-tighter border border-primary/20">Synced</span>
                                          )}
                                       </div>
                                       <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                                            {audit.created_at ? new Date(audit.created_at).toLocaleDateString() : "Legacy"} at {audit.created_at ? new Date(audit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                                          </span>
                                       </div>
                                     </div>
                                   </div>
                                 </div>

                                 {/* Categorical Pulse */}
                                 <div className="md:col-span-5 px-8 flex items-center justify-between gap-4 border-r border-white/5 h-full">
                                   {[
                                     { label: 'PERF', score: audit.performance_vector || 70, color: 'text-emerald-400' },
                                     { label: 'A11Y', score: audit.accessibility_score || 75, color: 'text-blue-400' },
                                     { label: 'SEO', score: audit.seo_score || 72, color: 'text-orange-400' },
                                     { label: 'BP', score: audit.best_practices_score || 72, color: 'text-purple-400' }
                                   ].map((cat) => (
                                     <div key={cat.label} className="text-center group/cat">
                                       <div className={`text-[11px] font-black italic tracking-tighter ${cat.score >= 90 ? cat.color : cat.score >= 70 ? 'text-white' : 'text-red-400'}`}>
                                         {cat.score}
                                       </div>
                                       <div className="text-[7px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover/cat:text-primary transition-colors">
                                         {cat.label}
                                       </div>
                                     </div>
                                   ))}
                                 </div>

                                 {/* Composite & Actions */}
                                 <div className="md:col-span-3 p-6 flex items-center justify-between bg-white/[0.01]">
                                   <div className="text-center">
                                     <div className={`text-2xl font-heading font-bold italic ${audit.composite_score >= 90 ? 'text-emerald-400' : 'text-primary'}`}>
                                       {audit.composite_score}%
                                     </div>
                                     <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30">Composite</div>
                                   </div>

                                   <div className="flex items-center gap-2">
                                      <Link href={`/audit?url=${encodeURIComponent(audit.url || "")}`} title="Refresh Audit">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5 hover:text-emerald-400">
                                          <RefreshCw className="h-3.5 w-3.5" />
                                        </Button>
                                      </Link>
                                      <Link href={`/audit/report-view?id=${audit.id}&url=${encodeURIComponent(audit.url || "")}`} title="View Snapshot">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5 hover:text-primary">
                                          <ExternalLink className="h-4 w-4" />
                                        </Button>
                                      </Link>
                                   </div>
                                 </div>
                               </div>
                             </div>
                          ))
                        )}
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>

        {/* Global Strategy Suggestions */}
        <div className="pt-20 border-t border-white/5 grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.3em] italic text-accent">Strategic Recommendations</h4>
               </div>
               <div className="grid gap-4">
                  <div className="glass-card p-6 bg-accent/5 border-accent/20 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-accent/40 transition-all">
                      <div className="space-y-1 text-center md:text-left">
                        <p className="text-[10px] text-accent/60 uppercase font-black">Audit Protocol</p>
                        <p className="text-sm font-heading italic">Start a fresh audit for another website.</p>
                      </div>
                      <Link href="/#audit-section">
                         <Button className="rounded-full bg-accent text-black font-bold uppercase tracking-widest text-[9px] h-10 px-6 border-none hover:bg-accent/80">Launch Fresh Audit</Button>
                      </Link>
                  </div>

                  <div className="glass-card p-6 bg-primary/5 border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary/40 transition-all">
                      <div className="space-y-1 text-center md:text-left">
                        <p className="text-[10px] text-primary/60 uppercase font-black">Builder Protocol</p>
                        <p className="text-[11px] font-body leading-tight max-w-[300px]">
                          Launch your AI based Landing or Web page in minutes with the all new WebBuilder AI for free. 
                          Get over the hassle of fixing when you can build a new one in no time.
                        </p>
                      </div>
                      <Link href="/builder">
                         <Button className="rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[9px] h-10 px-6 border-none hover:bg-primary/80">Start Building Now</Button>
                      </Link>
                  </div>
               </div>
            </div>

           <div className="space-y-6">
              <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.3em] italic text-primary">Audit Summary</h4>
               </div>
              <div className="grid grid-cols-2 gap-4">
                 {[
                    { label: "Matrix Coverage", value: "92%", color: "text-blue-400" },
                    { label: "Daily Audits", value: "1.2/day", color: "text-primary" }
                 ].map((kpi, i) => (
                   <div key={i} className="glass-card p-8 space-y-2 group hover:border-primary/20 transition-all">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">{kpi.label}</p>
                      <div className={`text-4xl font-heading font-bold italic ${kpi.color}`}>{kpi.value}</div>
                   </div>
                 ))}
              </div>
              <p className="text-[10px] text-muted-foreground italic px-2">Next automated synthesis scheduled for tomorrow at 04:00 AM.</p>
           </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-primary font-bold uppercase tracking-[0.4em]">Initializing Workspace...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
