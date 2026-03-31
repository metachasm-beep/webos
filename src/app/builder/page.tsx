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
  BookOpen,
  Quote,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Palette
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

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableNode } from "@/components/SortableNode";
import { AriaCoPilot } from "@/components/AriaCoPilot";
import { uploadBrandAsset } from "@/lib/storage";

// Theme Configuration
const GLOBAL_THEMES = {
  emerald: {
    primary: "oklch(0.75 0.15 150)", // Vivid Emerald
    accent: "oklch(0.85 0.1 190)",
    bg: "oklch(0.05 0.01 150)",
    label: "Emerald Synthesis"
  },
  sapphire: {
    primary: "oklch(0.65 0.2 250)", // Deep Sapphire
    accent: "oklch(0.75 0.15 190)",
    bg: "oklch(0.05 0.01 250)",
    label: "Sapphire Protocol"
  },
  ruby: {
    primary: "oklch(0.6 0.25 20)", // Crimson Ruby
    accent: "oklch(0.7 0.15 40)",
    bg: "oklch(0.05 0.01 20)",
    label: "Ruby Matrix"
  },
  obsidian: {
    primary: "oklch(0.98 0 0)", // White/Silver
    accent: "oklch(0.6 0 0)",
    bg: "oklch(0.02 0 0)", // Pure Black
    label: "Pure Obsidian"
  }
};

// Tooltip Helper
const ActionTooltip = ({ children, label }: { children: React.ReactNode, label: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
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
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
  const [activeTheme, setActiveTheme] = useState<keyof typeof GLOBAL_THEMES>("sapphire");

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
  const [matrixData, setMatrixData] = useState<any>(null);
  const [showMatrixDashboard, setShowMatrixDashboard] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Untethered Synthesis");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Try to get project ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
       setProjectId(id);
       // Fetch existing project (Logic to be added in fetchProjects)
    }
  }, []);

  // Autosave Engine
  useEffect(() => {
    if (!isMounted || nodes.length === 0) return;
    
    const saver = setTimeout(async () => {
      setIsSaving(true);
      try {
        const resp = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: projectId,
            name: projectName,
            nodes,
            theme: activeTheme
          })
        });
        const data = await resp.json();
        if (data.id && !projectId) {
          setProjectId(data.id);
          window.history.replaceState(null, "", `?id=${data.id}`);
        }
        setLastSaved(new Date());
      } catch (err) {
        console.error("Registry Sync Failure.", err);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => clearTimeout(saver);
  }, [nodes, activeTheme, projectName, isMounted, projectId]);

  // Theme & Typography Orchestration
  useEffect(() => {
    if (!isMounted) return;
    
    // Apply Typography
    const pair = pairings[activePairing as keyof typeof pairings];
    document.documentElement.style.setProperty('--font-heading', `var(${pair.heading})`);
    document.documentElement.style.setProperty('--font-body', `var(${pair.body})`);
    
    // Apply Global Theme
    const theme = GLOBAL_THEMES[activeTheme];
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--background', theme.bg);
  }, [activePairing, activeTheme, isMounted]);

  // Update Config CSS Variables
  useEffect(() => {
    if (!isMounted) return;
    document.documentElement.style.setProperty('--canvas-blur', `${blurValue}px`);
    document.documentElement.style.setProperty('--mesh-opacity', `${meshIntensity / 100}`);
    document.documentElement.style.setProperty('--chroma-shift', `${chromaShift}deg`);
  }, [blurValue, meshIntensity, chromaShift, isMounted]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setNodes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      if (!newNode.id) newNode.id = `node-${Date.now()}`;
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
    setTimeout(() => {
      setMatrixData({
        seo: { score: 84, trend: "up", alert: "none" },
        performance: { score: 92, trend: "up", alert: "none" },
        friction: { score: 18, trend: "down", alert: "warning" },
        conversion: { score: 4.2, trend: "up", alert: "strategic" }
      });
      setIsSyncing(false);
      setShowMatrixDashboard(true);
    }, 2000);
  };

  const handleFlushCanvas = () => {
    if (confirm("Are you sure you want to flush the Neural Canvas sequence? This cannot be undone.")) {
      setNodes([]);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    setIsUploading(true);
    try {
      const url = await uploadBrandAsset(file, `${projectId}/logo-${Date.now()}`);
      setLogoUrl(url);
    } catch (err) {
      console.error("Logo Upload Failure.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    setIsUploading(true);
    try {
      const url = await uploadBrandAsset(file, `${projectId}/favicon-${Date.now()}`);
      setFaviconUrl(url);
    } catch (err) {
      console.error("Favicon Upload Failure.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportStandalone = async () => {
    if (!projectId || nodes.length === 0) return;
    setIsExporting(true);
    try {
      const resp = await fetch(`/api/builder/export?id=${projectId}`, {
        method: "GET",
      });
      if (resp.ok) {
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `webos_synthesis_${projectId}.html`;
        a.click();
      } else {
        const data = await resp.json();
        alert(data.error || "Export failed. Pro Tier required?");
      }
    } catch (err) {
      console.error("Export Protocol Failure.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleAriaMutation = (mutations: any[]) => {
    setNodes(prev => {
      let newNodes = [...prev];
      mutations.forEach(m => {
        if (m.action === 'add') {
          if (!m.node.id) m.node.id = `node-${Date.now()}-${Math.random()}`;
          newNodes = [m.node, ...newNodes];
        } else if (m.action === 'update' && m.id) {
          const idx = newNodes.findIndex(n => n.id === m.id);
          if (idx !== -1) newNodes[idx] = { ...newNodes[idx], ...m.updates };
        } else if (m.action === 'delete' && m.id) {
          newNodes = newNodes.filter(n => n.id !== m.id);
        }
      });
      return newNodes;
    });
  };

  if (!isMounted) return null;

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
        {/* Sidebar Panel */}
        <aside className="w-80 glass border-r border-white/5 flex flex-col relative z-20 overflow-hidden">
            <div className="p-8 border-b border-white/5 space-y-1">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-heading font-bold italic tracking-tight">Design Board</h2>
                  <div className="flex items-center gap-2">
                     <div className={`h-1.5 w-1.5 rounded-full ${isSaving ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                     <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{isSaving ? 'Saving...' : 'Synced'}</span>
                  </div>
               </div>
               <input 
                 value={projectName}
                 onChange={(e) => setProjectName(e.target.value)}
                 className="bg-transparent border-none p-0 text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold outline-none focus:text-primary transition-colors"
               />
               {lastSaved && <p className="text-[8px] text-muted-foreground/30 uppercase italic">Last Sync: {lastSaved.toLocaleTimeString()}</p>}
            </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">
            <AnimatePresence mode="wait">
              {activeTab === "typography" ? (
                <motion.div 
                   key="typography"
                   initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                   className="space-y-6"
                >
                  <Button variant="ghost" onClick={() => setActiveTab(null)} className="p-0 h-auto text-[10px] uppercase font-bold tracking-widest gap-2 text-muted-foreground hover:text-white">
                    <ChevronRight className="h-3 w-3 rotate-180" /> Back
                  </Button>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">Typography Lab</h3>
                  <div className="space-y-3">
                    {Object.entries(pairings).map(([key, pair]) => (
                      <div 
                        key={key}
                        onClick={() => setActivePairing(key)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${activePairing === key ? 'bg-primary/10 border-primary' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className="text-xs font-bold mb-1">{pair.label}</div>
                        <div className="text-[10px] text-muted-foreground opacity-60">Heading: {pair.heading.replace('--font-heading-', '')}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : activeTab === "themes" ? (
                <motion.div 
                   key="themes"
                   initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                   className="space-y-6"
                >
                  <Button variant="ghost" onClick={() => setActiveTab(null)} className="p-0 h-auto text-[10px] uppercase font-bold tracking-widest gap-2 text-muted-foreground hover:text-white">
                    <ChevronRight className="h-3 w-3 rotate-180" /> Back
                  </Button>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">Global Themes</h3>
                  <div className="space-y-3">
                    {Object.entries(GLOBAL_THEMES).map(([key, theme]) => (
                      <div 
                        key={key}
                        onClick={() => setActiveTheme(key as any)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${activeTheme === key ? 'bg-primary/10 border-primary' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                          <div className="text-xs font-bold">{theme.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : activeTab === "asset-lab" ? (
                <motion.div 
                   key="asset-lab"
                   initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                   className="space-y-6"
                >
                  <Button variant="ghost" onClick={() => setActiveTab(null)} className="p-0 h-auto text-[10px] uppercase font-bold tracking-widest gap-2 text-muted-foreground hover:text-white">
                    <ChevronRight className="h-3 w-3 rotate-180" /> Back
                  </Button>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">AI Asset Lab</h3>
                  <div className="glass-dark border border-white/5 p-6 rounded-3xl space-y-4 text-center">
                    <div className="h-32 w-full rounded-2xl bg-white/5 flex items-center justify-center border border-dashed border-white/10 overflow-hidden relative">
                       {synthesizedAsset ? <img src={synthesizedAsset.url} className="w-full h-full object-cover opacity-60" /> : <ImageIcon className="h-8 w-8 text-muted-foreground/30" />}
                    </div>
                    <Button onClick={handleSynthesizeAsset} disabled={isSynthesizingAsset || !prompt} className="w-full bg-accent text-black font-bold uppercase tracking-widest text-[9px]">
                      {isSynthesizingAsset ? "Generating..." : "Synthesize Image"}
                    </Button>
                  </div>
                </motion.div>
              ) : activeTab === "branding" ? (
                <motion.div 
                   key="branding"
                   initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                   className="space-y-6"
                >
                  <Button variant="ghost" onClick={() => setActiveTab(null)} className="p-0 h-auto text-[10px] uppercase font-bold tracking-widest gap-2 text-muted-foreground hover:text-white">
                    <ChevronRight className="h-3 w-3 rotate-180" /> Back
                  </Button>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">Brand Identity</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <div className="flex justify-between items-center">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Logo Identity</label>
                          <span className="text-[8px] text-muted-foreground/40 font-bold uppercase tracking-widest">Max 5MB</span>
                       </div>
                       <div className="h-24 w-full rounded-2xl bg-white/5 border border-white/5 p-4 flex items-center justify-center relative overflow-hidden group">
                          {logoUrl ? <img src={logoUrl} className="max-h-full max-w-full object-contain" /> : <Plus className="h-4 w-4 opacity-30" />}
                          <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Favicon Icon</label>
                          <span className="text-[8px] text-muted-foreground/40 font-bold uppercase tracking-widest">Max 5MB</span>
                       </div>
                       <div className="h-16 w-16 rounded-xl bg-white/5 border border-white/5 p-2 flex items-center justify-center relative overflow-hidden group">
                          {faviconUrl ? <img src={faviconUrl} className="w-full h-full object-contain" /> : <ImageIcon className="h-4 w-4 opacity-30" />}
                          <input type="file" onChange={handleFaviconUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                    </div>
                    {isUploading && <p className="text-[8px] text-primary animate-pulse uppercase font-bold text-center">Neural Sync in Progress...</p>}
                  </div>
                </motion.div>
              ) : activeTab === "templates" ? (
                <motion.div 
                   key="templates"
                   initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
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
                    <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar">
                      {BUSINESS_TEMPLATES.map((tmpl) => (
                        <div key={tmpl.id} onClick={() => { setPrompt(tmpl.prompt); setStyle(tmpl.style); setFramework(tmpl.framework); setActiveTab(null); }} className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-primary/10 transition-all cursor-pointer">
                          <div className="text-xs font-bold">{tmpl.name}</div>
                          <p className="text-[9px] text-muted-foreground">{tmpl.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "Hero", type: "hero", icon: Layout },
                        { name: "Features", type: "features", icon: Layers },
                        { name: "Pricing", type: "pricing", icon: DollarSign },
                        { name: "Services", type: "service", icon: Briefcase },
                        { name: "Testimonial", type: "testimonial", icon: Quote },
                        { name: "Lead Magnet", type: "lead-magnet", icon: Sparkles },
                        { name: "CTA", type: "cta", icon: MousePointer2 },
                      ].map((mod, i) => (
                        <div key={i} onClick={() => { const d = { id: `node-${Date.now()}-${mod.type}`, type: mod.type, heading: `Modern ${mod.name}`, subheading: "Clean section design.", ctaText: "Get Started" }; setNodes([d, ...nodes]); setActiveTab(null); }} className="p-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-primary/10 text-center space-y-2 cursor-pointer group">
                           <mod.icon className="h-5 w-5 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                           <div className="text-[9px] font-bold uppercase">{mod.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                   {selectedNodeIndex !== null ? (
                     <div className="space-y-6">
                        <Button variant="ghost" onClick={() => setSelectedNodeIndex(null)} className="p-0 h-auto text-[10px] uppercase font-bold tracking-widest gap-2 text-muted-foreground hover:text-white">
                          <ChevronRight className="h-3 w-3 rotate-180" /> Back
                        </Button>
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Node Inspector</h3>
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase">Heading</label>
                              <input type="text" value={nodes[selectedNodeIndex]?.heading || ""} onChange={(e) => { const n = [...nodes]; n[selectedNodeIndex].heading = e.target.value; setNodes(n); }} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase">Subheading</label>
                              <textarea value={nodes[selectedNodeIndex]?.subheading || ""} onChange={(e) => { const n = [...nodes]; n[selectedNodeIndex].subheading = e.target.value; setNodes(n); }} className="w-full h-20 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none" />
                           </div>
                        </div>
                     </div>
                   ) : (
                     <>
                      <div className="space-y-4">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">Synthesis Protocol</h3>
                        <div className="space-y-2">
                          {[
                            { icon: BookOpen, label: "Templates", id: "templates" },
                            { icon: Palette, label: "Themes", id: "themes" },
                            { icon: Type, label: "Typography", id: "typography" },
                            { icon: Briefcase, label: "Branding", id: "branding" },
                            { icon: ImageIcon, label: "Asset Lab", id: "asset-lab" }
                          ].map((item, i) => (
                            <div key={i} onClick={() => setActiveTab(item.id)} className="glass-dark border border-white/5 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all group">
                              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:text-primary transition-colors"><item.icon className="h-5 w-5" /></div>
                              <div className="text-xs font-bold">{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4 pb-20">
                        <h3 className="text-[10px] uppercase font-bold text-primary">AI Synthesis</h3>
                        <form onSubmit={handleGenerate} className="space-y-3">
                          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe a section..." className="w-full h-24 glass-dark border border-white/10 rounded-2xl p-4 text-xs font-body focus:border-primary/50 outline-none transition-colors" />
                          <Button type="submit" disabled={isGenerating} className="w-full rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest h-12">
                            {isGenerating ? "Synthesizing..." : "Generate Section"}
                          </Button>
                        </form>
                      </div>
                     </>
                   )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Canvas Workspace */}
        <main className="flex-1 bg-black/5 relative p-12 overflow-y-auto" style={{ filter: `hue-rotate(${chromaShift}deg)` }}>
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex gap-4">
              <div className="glass px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                Live Canvas
              </div>
            </div>

            <div className={`space-y-12 pb-32 transition-all duration-700 ${isIsometric ? 'perspective-isometry' : ''}`}
                 style={isIsometric ? { transform: 'rotateX(20deg) rotateY(-10deg) scale(0.9)', transformStyle: 'preserve-3d' } : {}}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
                  <AnimatePresence>
                    {nodes.length === 0 ? (
                      <div className="glass-card min-h-[400px] flex flex-col items-center justify-center text-center p-12 space-y-4 border border-dashed border-white/10 opacity-40">
                         <Plus className="h-12 w-12" />
                         <p className="text-xl font-heading italic">Awaiting Synthesis Sequence</p>
                      </div>
                    ) : (
                      nodes.map((node, i) => (
                        <SortableNode key={node.id} id={node.id} index={i} isIsometric={isIsometric}>
                          <div className="relative group">
                            <div className="absolute -left-20 top-0 h-full flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                               <Button variant="ghost" size="icon" className="h-10 w-10 text-red-500 rounded-full glass" onClick={() => setNodes(nodes.filter(n => n.id !== node.id))}>
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-10 w-10 text-primary rounded-full glass" onClick={() => setSelectedNodeIndex(i)}>
                                 <Settings2 className="h-4 w-4" />
                               </Button>
                            </div>
                            <RenderNode node={node} idx={i} />
                          </div>
                        </SortableNode>
                      ))
                    )}
                  </AnimatePresence>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </main>

        {/* Global Toolbar */}
        <aside className="w-80 glass border-l border-white/5 p-8 space-y-12 relative z-20">
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase font-bold text-muted-foreground">Appearance</h3>
            {[
              { id: 'blur', label: "Blur", value: `${blurValue}px`, val: blurValue, onChange: setBlurValue, max: 64 },
              { id: 'mesh', label: "Mesh", value: `${meshIntensity}%`, val: meshIntensity, onChange: setMeshIntensity, max: 100 },
              { id: 'chroma', label: "Hue", value: `${chromaShift}°`, val: chromaShift, onChange: setChromaShift, max: 360 }
            ].map((config) => (
              <div key={config.id} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="uppercase">{config.label}</span>
                  <span className="text-primary">{config.value}</span>
                </div>
                <input type="range" min="0" max={config.max} value={config.val} onChange={(e) => config.onChange(parseInt(e.target.value))} className="w-full accent-primary h-1 bg-white/10 rounded-full outline-none" />
              </div>
            ))}
          </div>

          <div className="mt-auto space-y-4">
             <Button onClick={handleSyncMatrix} className="w-full bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30 h-12 uppercase font-bold tracking-widest text-[10px]">
               {isSyncing ? "Syncing..." : "Sync Matrix"}
             </Button>
             <Button onClick={handleExportStandalone} disabled={isExporting} className="w-full bg-accent text-black hover:bg-accent/80 h-12 uppercase font-bold tracking-widest text-[10px]">
               {isExporting ? "Exporting..." : "Export Standalone"}
             </Button>
             <Button variant="outline" onClick={handleExportJSON} className="w-full border-white/10 bg-white/5 h-12 uppercase font-bold tracking-widest text-[10px]">Export JSON</Button>
             <Button variant="destructive" onClick={handleFlushCanvas} className="w-full bg-red-500/10 text-red-500 border-none h-12 uppercase font-bold tracking-widest text-[10px]">Flush Canvas</Button>
          </div>
        </aside>
      </div>

      <AriaCoPilot onMutation={handleAriaMutation} currentNodes={nodes} />
    </div>
  );
}
