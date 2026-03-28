"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Settings2, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  MousePointer2,
  Sparkles,
  Layers,
  ChevronRight,
  Maximize2,
  Trash2,
  Download,
  RefreshCcw,
  Wind
} from "lucide-react";

import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

import { RenderNode } from "@/components/BuilderComponents";
import { useState, useEffect } from "react";

// Tooltip Helper
const ActionTooltip = ({ children, label }: { children: React.ReactNode, label: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        {children}
      </TooltipTrigger>
      <TooltipContent className="bg-black border border-white/10 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5">
        {label}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function BuilderPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("dark-saas");
  const [framework, setFramework] = useState("PAS");
  const [targetAudience, setTargetAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]);

  // Typography Lab State
  const [activePairing, setActivePairing] = useState("classic");
  const pairings = {
    classic: { heading: '--font-heading-classic', body: '--font-body-classic', label: "Classic Serif" },
    modern: { heading: '--font-heading-modern', body: '--font-body-modern', label: "Modern Sans" },
    elegant: { heading: '--font-heading-elegant', body: '--font-body-elegant', label: "Elegant Display" }
  };

  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Config State
  const [blurValue, setBlurValue] = useState(32);
  const [meshIntensity, setMeshIntensity] = useState(15);
  const [isSyncing, setIsSyncing] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update CSS Variables for real-time font config
  useEffect(() => {
    if (!isMounted) return;
    const pair = pairings[activePairing as keyof typeof pairings];
    document.documentElement.style.setProperty('--font-heading', `var(${pair.heading})`);
    document.documentElement.style.setProperty('--font-body', `var(${pair.body})`);
  }, [activePairing, isMounted]);

  // Update CSS Variables for real-time config
  useEffect(() => {
    if (!isMounted) return;
    document.documentElement.style.setProperty('--canvas-blur', `${blurValue}px`);
    document.documentElement.style.setProperty('--mesh-opacity', `${meshIntensity / 100}`);
  }, [blurValue, meshIntensity, isMounted]);

  if (!isMounted) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    try {
      const resp = await fetch("/api/builder/generate", {
        method: "POST",
        body: JSON.stringify({ 
          prompt, 
          style, 
          framework,
          targetAudience
        }),
        headers: { "Content-Type": "application/json" }
      });
      const newNode = await resp.json();
      setNodes([newNode, ...nodes]);
      setPrompt("");
    } catch (e) {
      console.error("Genesis Protocol Failure.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(nodes, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "neural_canvas_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleSyncMatrix = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const handleFlushCanvas = () => {
    if (confirm("Are you sure you want to flush the Neural Canvas sequence? This cannot be undone.")) {
      setNodes([]);
    }
  };

  const handleApplyHeuristic = () => {
    if (nodes.length === 0) return;
    // Simple heuristic: Boost contrast of the most recent node's background if it's dark
    const newNodes = [...nodes];
    const latest = { ...newNodes[0] };
    if (latest.style === "dark-saas") {
      alert("Heuristic Applied: Contrast optimized for Synthesis.");
    }
    setNodes(newNodes);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden relative font-body selection:bg-primary/20">
      <Navbar />
      <div 
        className="mesh-gradient transition-opacity duration-1000" 
        style={{ opacity: 'var(--mesh-opacity, 0.3)' }}
      />
      
      <div className="flex-1 flex pt-24">
        {/* Primitives Panel */}
        <aside className="w-80 glass border-r border-white/5 flex flex-col relative z-20 overflow-hidden">
          <div className="p-8 border-b border-white/5 space-y-1">
            <h2 className="text-xl font-heading font-bold italic tracking-tight">Neural Canvas</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Node Genesis Protocol</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">
            <AnimatePresence mode="wait">
              {activeTab === "typography" ? (
                <motion.div 
                   key="typography"
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   exit={{ x: -20, opacity: 0 }}
                   className="space-y-6"
                >
                  <Button variant="ghost" onClick={() => setActiveTab(null)} className="p-0 h-auto text-[10px] uppercase font-bold tracking-widest gap-2 text-muted-foreground hover:text-white">
                    <ChevronRight className="h-3 w-3 rotate-180" /> Back to Genesis
                  </Button>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">Typography Lab</h3>
                  <div className="space-y-3">
                    {Object.entries(pairings).map(([key, pair]) => (
                      <div 
                        key={key}
                        onClick={() => setActivePairing(key)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${activePairing === key ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className="text-xs font-bold mb-1">{pair.label}</div>
                        <div className="text-[10px] text-muted-foreground opacity-60">Heading: {pair.heading.replace('--font-heading-', '')}</div>
                        <div className="text-[10px] text-muted-foreground opacity-60">Body: {pair.body.replace('--font-body-', '')}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : activeTab === "asset-lab" ? (
                <motion.div 
                   key="asset-lab"
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   exit={{ x: -20, opacity: 0 }}
                   className="space-y-6"
                >
                  <Button variant="ghost" onClick={() => setActiveTab(null)} className="p-0 h-auto text-[10px] uppercase font-bold tracking-widest gap-2 text-muted-foreground hover:text-white">
                    <ChevronRight className="h-3 w-3 rotate-180" /> Back to Genesis
                  </Button>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">Asset Synthesis Lab</h3>
                  <div className="glass-dark border border-white/5 p-6 rounded-3xl space-y-4">
                     <div className="h-32 w-full rounded-2xl bg-white/5 flex items-center justify-center border border-dashed border-white/10">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                     </div>
                     <p className="text-[10px] text-muted-foreground text-center">Neural image synthesis engine currently initializing...</p>
                     <Button className="w-full h-10 rounded-xl bg-accent text-black font-bold uppercase tracking-widest text-[9px]">Synthesize Asset</Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="main"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="space-y-8"
                >
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">Synthesis Agents</h3>
                    <div className="space-y-2">
                      {[
                        { icon: Sparkles, label: "AI Generator", desc: "Synthesize section via natural language", tooltip: "Access advanced LLM parameters", id: "generator" },
                        { icon: Type, label: "Typography", desc: "Global font matrix control", tooltip: "Pair distinctive headings with body fonts", id: "typography" },
                        { icon: ImageIcon, label: "Asset Lab", desc: "Neural image generation", tooltip: "Synthesize custom high-res assets", id: "asset-lab" }
                      ].map((item, i) => (
                        <ActionTooltip key={i} label={item.tooltip}>
                          <div 
                            onClick={() => setActiveTab(item.id)}
                            className="glass-dark border border-white/5 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all group"
                          >
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                              <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold">{item.label}</div>
                              <div className="text-[9px] text-muted-foreground mt-0.5">{item.desc}</div>
                            </div>
                          </div>
                        </ActionTooltip>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pb-20">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Genesis Protocol</h3>
                    <form onSubmit={handleGenerate} className="space-y-3">
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your enterprise node (e.g., 'Cloud Security for Fintech')..."
                        className="w-full h-32 glass-dark border border-white/10 rounded-2xl p-4 text-xs font-body focus:border-primary/50 outline-none transition-colors"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-muted-foreground uppercase px-2">Framework</label>
                          <select 
                            value={framework} 
                            onChange={(e) => setFramework(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] outline-none"
                          >
                            <option value="PAS">PAS (Problem)</option>
                            <option value="AIDA">AIDA (Sales)</option>
                            <option value="BAB">BAB (Bridge)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-muted-foreground uppercase px-2">Style</label>
                          <select 
                            value={style} 
                            onChange={(e) => setStyle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] outline-none"
                          >
                            <option value="dark-saas">Dark SaaS</option>
                            <option value="clean-minimal">Minimal</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-muted-foreground uppercase px-2">Audience Intelligence</label>
                        <input 
                          type="text"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          placeholder="e.g., CTOs, Growth Marketers"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] outline-none"
                        />
                      </div>

                      <ActionTooltip label="Trigger neural synthesis of the landing page component">
                        <Button 
                          type="submit" 
                          disabled={isGenerating}
                          className="w-full rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest h-12 shadow-2xl shadow-primary/20"
                        >
                          {isGenerating ? "Synthesizing..." : "Initialize Genesis"}
                          <Sparkles className="ml-2 h-4 w-4" />
                        </Button>
                      </ActionTooltip>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Neural Canvas Workspace */}
        <main className="flex-1 bg-black/5 relative p-12 overflow-y-auto z-0">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex items-center justify-between">
               <div className="flex gap-4">
                  <div className="glass px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    Live Preview
                  </div>
                  <div className="glass-dark px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Draft: V.2.1.0
                  </div>
               </div>
               <div className="flex gap-3">
                  <ActionTooltip label="Download Neural Canvas configuration as JSON">
                    <Button 
                      variant="outline" 
                      onClick={handleExportJSON}
                      className="rounded-full border-white/10 text-xs px-6 hover:bg-white/5 h-10 gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export JSON
                    </Button>
                  </ActionTooltip>
                  <ActionTooltip label="Synchronize current architecture with Growth Matrix">
                    <Button 
                      onClick={handleSyncMatrix}
                      disabled={isSyncing}
                      className="rounded-full bg-primary text-white text-xs px-8 shadow-2xl shadow-primary/20 h-10 gap-2"
                    >
                      <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? "Syncing..." : "Sync Matrix"}
                    </Button>
                  </ActionTooltip>
               </div>
            </div>

            {/* Simulated Glass Website Section */}
            <div className="space-y-12 pb-32">
              <AnimatePresence>
                {nodes.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card min-h-[400px] flex flex-col items-center justify-center text-center p-12 space-y-6"
                  >
                    <div className="h-20 w-20 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                      <Plus className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-heading font-bold italic">Canvas Empty</h3>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">Initialize the Genesis Protocol to synthesize high-conversion nodes.</p>
                    </div>
                  </motion.div>
                ) : (
                  nodes.map((node, i) => (
                    <motion.div 
                      key={i} 
                      className="relative group"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="absolute -left-16 top-0 h-full flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ActionTooltip label="Remove this node from the synthesis sequence">
                           <Button 
                             variant="ghost" 
                             className="h-10 w-10 p-0 text-red-400 hover:bg-red-500/10 rounded-full glass" 
                             onClick={() => setNodes(nodes.filter((_, idx) => idx !== i))}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </ActionTooltip>
                         <ActionTooltip label="Inspect Node Metadata">
                           <Button variant="ghost" className="h-10 w-10 p-0 text-primary hover:bg-primary/10 rounded-full glass">
                             <Maximize2 className="h-4 w-4" />
                           </Button>
                         </ActionTooltip>
                      </div>
                      <RenderNode node={node} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Global Config Panel */}
        <aside className="w-80 glass border-l border-white/5 p-8 space-y-12 relative z-20">
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">Matrix Config</h3>
            <div className="space-y-6">
              {[
                { label: "Backdrop Blur", value: `${blurValue}px`, percent: blurValue / 64 * 100, onChange: setBlurValue, max: 64 },
                { label: "Mesh Intensity", value: `${meshIntensity}%`, percent: meshIntensity, onChange: setMeshIntensity, max: 100 },
                { label: "Chroma Shift", value: "None", percent: 0, onChange: () => {}, max: 100 }
              ].map((config, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between text-[11px] font-bold font-body">
                    <span className="text-muted-foreground uppercase tracking-widest">{config.label}</span>
                    <span className="text-primary">{config.value}</span>
                  </div>
                  <div className="relative h-6 flex items-center cursor-pointer group">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={false}
                        animate={{ width: `${config.percent}%` }}
                        className="h-full bg-primary rounded-full" 
                      />
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max={config.max}
                      value={config.max === 64 ? blurValue : meshIntensity}
                      onChange={(e) => config.onChange(parseInt(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-6">
             <div className="p-6 glass-dark border border-white/5 rounded-3xl space-y-4 relative group hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                   <Sparkles className="h-5 w-5 text-accent" />
                   <span className="text-xs font-bold uppercase tracking-widest italic text-accent">AI Suggestions</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Consider increasing contrast on your CTA node for higher conversion synaptic flow.</p>
                <ActionTooltip label="Automatically apply this optimization to the active node">
                  <Button 
                    variant="ghost" 
                    onClick={handleApplyHeuristic}
                    className="w-full text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5 p-0 text-left justify-start gap-3 mt-2"
                  >
                    Apply Heuristic <ChevronRight className="h-3 w-3" />
                  </Button>
                </ActionTooltip>
             </div>
          </div>

          <div className="absolute bottom-12 left-8 right-8 space-y-4">
             <ActionTooltip label="Reset the entire Neural Canvas workspace">
               <Button 
                 variant="destructive" 
                 onClick={handleFlushCanvas}
                 className="w-full h-12 rounded-2xl gap-3 text-[10px] bg-red-500/10 text-red-500 hover:bg-red-500/20 border-white/5 border shadow-none font-bold uppercase tracking-widest"
               >
                  <Wind className="h-4 w-4" />
                  Flush Sequence
               </Button>
             </ActionTooltip>
          </div>
        </aside>
      </div>
    </div>
  );
}
