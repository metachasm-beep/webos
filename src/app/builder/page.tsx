"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Wind,
  Search,
  BookOpen
} from "lucide-react";
import Squares from "@/components/reactbits/Squares";
import ShinyText from "@/components/reactbits/ShinyText";

import { BUSINESS_TEMPLATES, Template } from "@/lib/templates";


import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

import { RenderNode } from "@/components/BuilderComponents";


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
  const [chromaShift, setChromaShift] = useState(0);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynthesizingAsset, setIsSynthesizingAsset] = useState(false);
  const [synthesizedAsset, setSynthesizedAsset] = useState<any>(null);
  const [subTab, setSubTab] = useState<'templates' | 'modules'>('templates');
  const [isIsometric, setIsIsometric] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
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
    document.documentElement.style.setProperty('--chroma-shift', `${chromaShift}deg`);
  }, [blurValue, meshIntensity, chromaShift, isMounted]);


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

  const handleSynthesizeAsset = async () => {
    if (isSynthesizingAsset) return;
    setIsSynthesizingAsset(true);
    try {
      const resp = await fetch("/api/builder/synthesize-image", {
        method: "POST",
        body: JSON.stringify({ prompt: "High-tech abstract visualization for " + prompt, style }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await resp.json();
      setSynthesizedAsset(data);
    } catch (e) {
      console.error("Asset Synthesis Protocol Failure.");
    } finally {
      setIsSynthesizingAsset(false);
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
      <div className="fixed inset-0 z-0">
        <Squares 
          direction="diagonal"
          speed={0.5}
          squareSize={40}
          borderColor="rgba(255, 255, 255, 0.03)"
          hoverFillColor="rgba(59, 130, 246, 0.1)"
        />
      </div>
      <div 
        className="mesh-gradient transition-opacity duration-1000" 
        style={{ 
          opacity: 'var(--mesh-opacity, 0.3)',
          filter: `blur(var(--canvas-blur, 32px)) hue-rotate(var(--chroma-shift, 0deg))`
        }}
      />
      
      <div className="flex-1 flex pt-16">

        {/* Primitives Panel */}
        <aside className="w-80 glass border-r border-white/5 flex flex-col relative z-20 overflow-hidden">
          <div className="p-8 border-b border-white/5 space-y-1">
            <h2 className="text-xl font-heading font-bold italic tracking-tight">Design Board</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Section Creation Tools</p>
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
                    <ChevronRight className="h-3 w-3 rotate-180" /> Back to Tools
                  </Button>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">AI Image Creator</h3>
                   <div className="glass-dark border border-white/5 p-6 rounded-3xl space-y-4">
                      <div className="h-32 w-full rounded-2xl bg-white/5 flex items-center justify-center border border-dashed border-white/10 overflow-hidden relative">
                         {synthesizedAsset ? (
                            <img src={synthesizedAsset.url} className="w-full h-full object-cover opacity-60" alt="Synthesized" />
                         ) : (
                            <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                         )}
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center">AI image generator {isSynthesizingAsset ? "active..." : "ready."}</p>
                      <Button 
                        onClick={handleSynthesizeAsset}
                        disabled={isSynthesizingAsset || !prompt}
                        className="w-full h-10 rounded-xl bg-accent text-black font-bold uppercase tracking-widest text-[9px]"
                      >
                        {isSynthesizingAsset ? "Generating..." : "Create Image"}
                      </Button>
                   </div>
                </motion.div>
              ) : activeTab === "templates" ? (
                <motion.div 
                   key="templates"
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   exit={{ x: -20, opacity: 0 }}
                   className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Library</h3>
                    <div className="flex gap-2">
                       <button onClick={() => setSubTab('templates')} className={`text-[8px] uppercase font-bold tracking-widest ${subTab === 'templates' ? 'text-primary' : 'text-muted-foreground'}`}>Templates</button>
                       <button onClick={() => setSubTab('modules')} className={`text-[8px] uppercase font-bold tracking-widest ${subTab === 'modules' ? 'text-primary' : 'text-muted-foreground'}`}>Modules</button>
                    </div>
                  </div>

                  
                  {subTab === 'templates' ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <input 
                          type="text" 
                          placeholder="Search 50+ templates..." 
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-[10px] outline-none"
                        />
                      </div>

                      <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        {BUSINESS_TEMPLATES.map((tmpl, idx) => (
                          <motion.div 
                            key={tmpl.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => {
                              setPrompt(tmpl.prompt);
                              setStyle(tmpl.style);
                              setFramework(tmpl.framework);
                              setActiveTab(null);
                            }}
                            className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="text-xs font-bold group-hover:text-primary transition-colors">{tmpl.name}</div>
                              <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground uppercase">{tmpl.category}</span>
                            </div>
                            <p className="text-[9px] text-muted-foreground leading-relaxed">{tmpl.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "Hero Deep", type: "hero", icon: Layout },
                          { name: "Features Grid", type: "features", icon: Layers },
                          { name: "Pricing Table", type: "pricing", icon: Sparkles },
                          { name: "CTA Block", type: "cta", icon: MousePointer2 },
                        ].map((mod, i) => (
                          <div 
                            key={i}
                            onClick={() => {
                              const dummyNode = {
                                type: mod.type,
                                heading: `Modern ${mod.name}`,
                                subheading: "Professional section for your business.",
                                ctaText: "Get Started",
                                visualData: { variant: "glass", intensity: 50, accentColor: "#3b82f6" }
                              };
                              setNodes([dummyNode, ...nodes]);
                              setActiveTab(null);
                            }}
                            className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer text-center space-y-2 group"
                          >
                            <mod.icon className="h-5 w-5 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="text-[10px] font-bold uppercase tracking-widest">{mod.name}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[8px] text-muted-foreground text-center italic">Modules are pre-built and load instantly.</p>
                    </div>
                  )}

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
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">Design Tools</h3>
                    <div className="space-y-2">
                      {[
                        { icon: BookOpen, label: "Business Templates", desc: "Choose from 50+ industries", tooltip: "Quickly start with a pre-made business goal", id: "templates" },
                        { icon: Sparkles, label: "AI Generator", desc: "Create section with a description", tooltip: "Describe what you want to build", id: "generator" },
                        { icon: Type, label: "Font Settings", desc: "Change website typography", tooltip: "Pick beautiful font pairings", id: "typography" },
                        { icon: ImageIcon, label: "AI Image Creator", desc: "Generate custom website images", tooltip: "Create high-quality assets with AI", id: "asset-lab" }
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
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Add New Section</h3>
                    <form onSubmit={handleGenerate} className="space-y-3">
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your website goal (e.g., 'A modern law firm' or 'A cozy cafe')..."
                        className="w-full h-32 glass-dark border border-white/10 rounded-2xl p-4 text-xs font-body focus:border-primary/50 outline-none transition-colors"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-muted-foreground uppercase px-2">Sales Strategy</label>
                          <select 
                            value={framework} 
                            onChange={(e) => setFramework(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] outline-none"
                          >
                            <option value="PAS">Problem/Solution</option>
                            <option value="AIDA">Attention/Sales</option>
                            <option value="BAB">Bridge/Outcome</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-muted-foreground uppercase px-2">Page Look</label>
                          <select 
                            value={style} 
                            onChange={(e) => setStyle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] outline-none"
                          >
                            <option value="dark-saas">Dark Modern</option>
                            <option value="clean-minimal">Clean Minimal</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-muted-foreground uppercase px-2">Who is this for?</label>
                        <input 
                          type="text"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          placeholder="e.g., Small business owners, CTOs"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] outline-none"
                        />
                      </div>

                      <ActionTooltip label="Build your website section using AI">
                        <Button 
                          type="submit" 
                          disabled={isGenerating}
                          className="w-full rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest h-12 shadow-2xl shadow-primary/20"
                        >
                          {isGenerating ? "Building..." : "Generate Section"}
                          <Sparkles className="ml-2 h-4 w-4" />
                        </Button>
                      </ActionTooltip>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Workplace Action Buttons (Moved from Header) */}
            <div className="mt-auto p-2 space-y-2 border-t border-white/5 pt-6">
                <Button 
                  variant="outline" 
                  onClick={handleExportJSON}
                  className="w-full rounded-2xl border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest h-10 gap-2 hover:bg-white/10"
                >
                  <Download className="h-3 w-3" />
                  Export JSON
                </Button>
                <button 
                  onClick={() => setIsIsometric(!isIsometric)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wider ${isIsometric ? 'bg-accent/20 text-accent' : 'hover:bg-white/5 text-muted-foreground'}`}
                >
                  <Layers className="h-4 w-4" />
                  {isIsometric ? "Standard View" : "Isometric View"}
                </button>
                <Button 
                  onClick={handleSyncMatrix}
                  disabled={isSyncing}
                  className="w-full rounded-2xl bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-widest h-10 gap-2 hover:bg-primary/30"
                >
                  <RefreshCcw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? "Syncing..." : "Sync Matrix"}
                </Button>
            </div>
          </div>
        </aside>

        {/* Neural Canvas Workspace */}
        <main className="flex-1 bg-black/5 relative p-12 overflow-y-auto z-0" style={{ filter: `hue-rotate(${chromaShift}deg)` }}>
          <div className="max-w-4xl mx-auto space-y-12">
             <div className="flex items-center justify-between">
               <div className="flex gap-4">
                  <div className="glass px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    <ShinyText text="Live Preview" speed={3} className="text-primary font-bold" />
                  </div>
                  <div className="glass-dark px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <ShinyText text="Draft: V.2.1.0" speed={10} disabled color="rgba(255,255,255,0.4)" />
                  </div>
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
                      <h3 className="text-2xl font-heading font-bold italic">Design Board Empty</h3>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">Choose a template or describe a section to start building your website.</p>
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
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">Appearance</h3>
            <div className="space-y-6">
              {[
                { id: 'blur', label: "Background Blur", value: `${blurValue}px`, percent: blurValue / 64 * 100, onChange: setBlurValue, max: 64 },
                { id: 'mesh', label: "Gradient Strength", value: `${meshIntensity}%`, percent: meshIntensity, onChange: setMeshIntensity, max: 100 },
                { id: 'chroma', label: "Color Shift", value: `${chromaShift}°`, percent: chromaShift / 360 * 100, onChange: setChromaShift, max: 360 }
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
                      value={config.id === 'blur' ? blurValue : config.id === 'mesh' ? meshIntensity : chromaShift}
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
                <p className="text-[10px] text-muted-foreground leading-relaxed">Try increasing the contrast on your main button to help it stand out!</p>
                <ActionTooltip label="Automatically improve this section">
                  <Button 
                    variant="ghost" 
                    onClick={handleApplyHeuristic}
                    className="w-full text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5 p-0 text-left justify-start gap-3 mt-2"
                  >
                    Optimize Design <ChevronRight className="h-3 w-3" />
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
                  Reset Designer
               </Button>
             </ActionTooltip>
          </div>
        </aside>
      </div>
    </div>
  );
}
