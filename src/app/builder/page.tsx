"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  Palette,
  Target,
  FlaskConical,
  Activity,
  Cpu,
  CornerUpLeft,
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import Squares from "@/components/reactbits/Squares";
import ShinyText from "@/components/reactbits/ShinyText";
import StarBorder from "@/components/reactbits/StarBorder";
import PlasmaWave from "@/components/reactbits/PlasmaWave";

import { BUSINESS_TEMPLATES, Template } from "@/lib/templates";
import { 
  SECTION_TEMPLATES as CATEGORICAL_SECTIONS 
} from "@/lib/templates";

import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

import { RenderNode } from "@/components/BuilderComponents";
import { WorkspaceAsset } from "@/components/WorkspaceAsset";
import { BuilderNodeControls } from "@/components/BuilderNodeControls";

const STEPS = [
  { id: 1, label: "Context", title: "Core Synthesis", icon: Target, description: "Define your project parameters." },
  { id: 2, label: "DNA", title: "Brand Identity", icon: Sparkles, description: "Infuse with brand assets." },
  { id: 3, label: "Atmosphere", title: "Visual Style", icon: Palette, description: "Select theme & fonts." },
  { id: 4, label: "Synthesis", title: "Component Labs", icon: Cpu, description: "Generate sections." },
  { id: 5, label: "Matrix", title: "Neural Tuning", icon: Activity, description: "Adjust global properties." },
  { id: 6, label: "Gallery", title: "Hypermedia", icon: ImageIcon, description: "Add resizable workspace assets." },
  { id: 7, label: "Export", title: "Emission", icon: Download, description: "Review and launch." }
];

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
import { NeuralInsightHUD } from "@/components/NeuralScoreBadge";
import { FloatingAsset } from "@/components/FloatingAsset";
import { useAriaAutonomy } from "@/hooks/useAriaAutonomy";
import { 
  PRESET_THEMES, 
  TYPOGRAPHY_PAIRINGS, 
  DesignTheme 
} from "@/lib/design-system";

// Tooltip Helper

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
  const [currentStep, setCurrentStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("dark-saas");
  const [framework, setFramework] = useState("PAS");
  const [targetAudience, setTargetAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
  const [activeThemeId, setActiveThemeId] = useState<string>("sapphire");
  const [activeDesign, setActiveDesign] = useState<DesignTheme>(PRESET_THEMES.sapphire);

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
  const [activePairingId, setActivePairingId] = useState("modern");

  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Config State
  const [blurValue, setBlurValue] = useState(32);
  const [meshIntensity, setMeshIntensity] = useState(15);
  const [chromaShift, setChromaShift] = useState(0);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynthesizingAsset, setIsSynthesizingAsset] = useState(false);
  const [synthesizedAsset, setSynthesizedAsset] = useState<any>(null);
  const [subTab, setSubTab] = useState<'templates' | 'sections'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof CATEGORICAL_SECTIONS>('HERO');
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
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [logoStatus, setLogoStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [faviconStatus, setFaviconStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [logoError, setLogoError] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeOptionsId, setActiveOptionsId] = useState<string | null>(null);
  const [activeSettingsNode, setActiveSettingsNode] = useState<number | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [floatingAssets, setFloatingAssets] = useState<any[]>([]);

  const autonomy = useAriaAutonomy(nodes, matrixData);

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
            theme: activeThemeId
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
  }, [nodes, activeThemeId, projectName, isMounted, projectId]);

  // Theme & Typography Orchestration
  useEffect(() => {
    if (!isMounted) return;
    
    // Apply Global Design Tokens
    const design = activeDesign;
    document.documentElement.style.setProperty('--font-heading', design.headingFont);
    document.documentElement.style.setProperty('--font-body', design.bodyFont);
    document.documentElement.style.setProperty('--primary', design.primary);
    document.documentElement.style.setProperty('--accent', design.accent);
    document.documentElement.style.setProperty('--background', design.bg);
    document.documentElement.style.setProperty('--radius', design.radius);
    document.documentElement.style.setProperty('--glass-opacity', `${design.glassIntensity / 100}`);
    
  }, [activeDesign, isMounted]);

  // Sync activeDesign when IDs change (manual selection)
  useEffect(() => {
    if (PRESET_THEMES[activeThemeId]) {
      const preset = PRESET_THEMES[activeThemeId];
      const pairing = TYPOGRAPHY_PAIRINGS[activePairingId as keyof typeof TYPOGRAPHY_PAIRINGS];
      if (pairing) {
        setActiveDesign({
          ...preset,
          headingFont: pairing.heading,
          bodyFont: pairing.body
        });
      }
    }
  }, [activeThemeId, activePairingId]);

  // Live Neural Evaluation Observer
  useEffect(() => {
    if (!isMounted || nodes.length === 0) return;
    
    const evaluator = setTimeout(async () => {
      setIsSyncing(true);
      try {
        const resp = await fetch("/api/builder/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes })
        });
        const data = await resp.json();
        if (data.success) {
          setMatrixData(data.matrix);
          setShowMatrixDashboard(true);
        }
      } catch (err) {
        console.error("Neural Evaluation Protocol Failure.", err);
      } finally {
        setIsSyncing(false);
      }
    }, 1500); // Debounce for 1.5s to preserve compute

    return () => clearTimeout(evaluator);
  }, [nodes, isMounted]);

  // Update Config CSS Variables
  useEffect(() => {
    if (!isMounted) return;
    document.documentElement.style.setProperty('--canvas-blur', `${blurValue}px`);
    document.documentElement.style.setProperty('--mesh-opacity', `${meshIntensity / 100}`);
    document.documentElement.style.setProperty('--chroma-shift', `${chromaShift}deg`);
    
    // Explicitly update the body for global inheritance
    document.body.style.setProperty('--canvas-blur', `${blurValue}px`);
    document.body.style.setProperty('--mesh-opacity', `${meshIntensity / 100}`);
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
    // Now just a manual trigger for the existing observer logic if needed
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleFlushCanvas = () => {
    if (confirm("Are you sure you want to flush the Neural Canvas sequence? This cannot be undone.")) {
      setNodes([]);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLogoStatus('uploading');
    try {
      const localUrl = URL.createObjectURL(file);
      setLogoUrl(localUrl);
      setLogoStatus('success');
      setTimeout(() => setLogoStatus('idle'), 3000);
    } catch (err: any) {
      setLogoStatus('error');
      setLogoError("Synthesis Collision");
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFaviconStatus('uploading');
    try {
      const localUrl = URL.createObjectURL(file);
      setFaviconUrl(localUrl);
      setFaviconStatus('success');
      setTimeout(() => setFaviconStatus('idle'), 3000);
    } catch (err: any) {
      setFaviconStatus('error');
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

  const handleNeuralThemeSynthesis = async () => {
    setIsSyncing(true);
    try {
      const resp = await fetch("/api/builder/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          brandDescription: projectName, 
          logoColors: [] // Could be enhanced with actual extraction
        })
      });
      const data = await resp.json();
      if (!data.error) {
        // Map API response to DesignTheme interface
        const synthesized: DesignTheme = {
          id: "neural-" + Date.now(),
          label: "Neural Synthesis",
          primary: data.primary,
          accent: data.accent,
          bg: data.bg,
          headingFont: TYPOGRAPHY_PAIRINGS[data.headingFont as keyof typeof TYPOGRAPHY_PAIRINGS]?.heading || TYPOGRAPHY_PAIRINGS.modern.heading,
          bodyFont: TYPOGRAPHY_PAIRINGS.modern.body,
          radius: data.radius || "24px",
          glassIntensity: data.glass || 20
        };
        setActiveDesign(synthesized);
        setActiveThemeId("neural");
      }
    } catch (err) {
      console.error("Neural Theme Synthesis Failure.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMultiImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setFloatingAssets(prev => [...prev, {
          id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: url,
          x: 100 + Math.random() * 400,
          y: 100 + Math.random() * 400,
          w: 300,
          h: 300
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateAsset = (id: string, updates: any) => {
    setFloatingAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleDeleteAsset = (id: string) => {
    setFloatingAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const images = files.filter(f => f.type.startsWith('image/'));
    
    for (const img of images) {
       const url = URL.createObjectURL(img);
       setFloatingAssets(prev => [...prev, {
         id: `asset-${Date.now()}-${Math.random()}`,
         url: url,
         x: e.clientX - 200, // Offset for sidebar
         y: e.clientY - 100,
         w: 300,
         h: 300
       }]);
    }
  };

  const handleContentChange = (idx: number, updates: any) => {
    setNodes(prev => {
      const newNodes = [...prev];
      newNodes[idx] = { ...newNodes[idx], ...updates };
      return newNodes;
    });
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
        } else if (m.action === 'reorder' && m.newOrder) {
          // Re-sequence based on the provided array of IDs
          newNodes = m.newOrder
            .map((id: string) => prev.find(n => n.id === id))
            .filter(Boolean);
        }
      });
      return newNodes;
    });
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col font-body selection:bg-primary/30 text-foreground overflow-hidden">
      <Navbar />

      <div className="flex-1 flex min-h-0 overflow-hidden relative pt-[69px]">
        {/* Unified Background Substrate */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <Squares 
            direction="diagonal"
            speed={0.5}
            squareSize={40}
            borderColor="rgba(255, 255, 255, 0.03)"
            hoverFillColor="rgba(59, 130, 246, 0.1)"
          />
          <div 
            className="mesh-gradient absolute inset-0 transition-opacity duration-1000 opacity-[var(--mesh-opacity,0.3)]" 
            style={{ 
              filter: `blur(var(--canvas-blur, 32px)) hue-rotate(var(--chroma-shift, 0deg))`
            }}
          />
        </div>
        {/* Sidebar Panel */}
        <aside className="w-85 glass border-r border-white/5 flex flex-col relative z-20 overflow-hidden">
            {/* Plasma Background for Sidebar */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              <PlasmaWave speed1={0.02} speed2={0.01} bend1={2} bend2={1} />
            </div>

            <div className="p-4 border-b border-white/5 space-y-2 relative z-10 bg-background/40 backdrop-blur-md">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <FlaskConical className="h-5 w-5 text-primary" />
                     <h2 className="text-xl font-heading font-bold italic tracking-tight">Synthesis Board</h2>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className={`h-1.5 w-1.5 rounded-full ${isSaving ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                     <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{isSaving ? 'Saving...' : 'Synced'}</span>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-widest">Active Step</span>
                  <div className="h-[1px] flex-1 bg-white/5" />
                  <span className="text-[10px] text-primary font-black italic">{currentStep} / 7</span>
               </div>
            </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 relative z-10 no-scrollbar">
            {/* Neural Assistant Guidance */}
            <StarBorder className="p-4 bg-primary/5 rounded-2xl relative overflow-hidden group">
               <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 relative">
                     <Sparkles className="h-5 w-5" />
                     <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Neural Assistant / Aria</h4>
                     <p className="text-[10.5px] leading-relaxed italic text-white/70">
                        {currentStep === 1 && "Initialization sequence starting. Define the goal of your digital synthesis."}
                        {currentStep === 2 && "Sync your brand DNA. Upload a logo to extract spectral data."}
                        {currentStep === 3 && "Atmosphere selection active. Choose a visual language for your emission."}
                        {currentStep === 4 && "Synthesis core online. Generate components or select atomic Site Presets."}
                        {currentStep === 5 && "Neural Matrix tuning active. Adjust the global visual intensity."}
                        {currentStep === 6 && "Inject additional brand hypermedia. Assets here are resizable and persistent."}
                        {currentStep === 7 && "Synthesis complete. Review neural integrity and export standalone."}
                     </p>
                  </div>
               </div>
            </StarBorder>

            <AnimatePresence mode="wait">
              {/* Step 1: Context */}
              {currentStep === 1 && (
                <motion.div 
                   key="step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                   className="space-y-6 pt-4"
                >
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <ActionTooltip label="Name your digital footprint">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Project Name</label>
                      </ActionTooltip>
                      <input 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g. Genesis Protocol"
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-xs font-body focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <ActionTooltip label="Who are we building for?">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Target Audience</label>
                      </ActionTooltip>
                      <input 
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g. Enterprise SaaS founders"
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-xs font-body focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <Button onClick={() => setCurrentStep(2)} className="w-full h-14 bg-primary text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-lg shadow-primary/20 group">
                    <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                    Initialize Protocol
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Branding */}
              {currentStep === 2 && (
                <motion.div 
                   key="step2" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                   className="space-y-8 pt-4"
                >
                     <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Logo Identity</label>
                          <ActionTooltip label={logoStatus === 'error' ? `Error: ${logoError}` : "Sync your brand's core visual DNA. Selection will appear instantly."}>
                            <div className={`h-44 w-full rounded-2xl bg-white/5 border p-4 flex items-center justify-center relative overflow-hidden group transition-all cursor-pointer ${logoStatus === 'error' ? 'border-red-500/50 bg-red-500/5' : logoStatus === 'success' ? 'border-green-500/50 bg-green-500/5' : 'border-white/5 hover:border-primary/40'}`}>
                               {logoStatus === 'uploading' ? (
                                  <div className="flex flex-col items-center gap-3 animate-pulse">
                                     <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
                                     <span className="text-[9px] uppercase font-black tracking-[0.2em] text-primary">Scanning DNA...</span>
                                  </div>
                               ) : logoStatus === 'success' ? (
                                  <div className="flex flex-col items-center gap-3 text-green-500">
                                     <CheckCircle2 className="h-8 w-8" />
                                     <span className="text-[9px] uppercase font-black tracking-[0.2em]">Synthesis Complete</span>
                                  </div>
                               ) : logoStatus === 'error' ? (
                                  <div className="flex flex-col items-center gap-3 text-red-500 p-4 text-center">
                                     <AlertCircle className="h-8 w-8" />
                                     <span className="text-[9px] uppercase font-black tracking-[0.2em]">Protocol Failed</span>
                                     <p className="text-[7px] opacity-60 uppercase leading-relaxed">{logoError}</p>
                                  </div>
                               ) : logoUrl ? (
                                  <div className="relative h-full w-full flex items-center justify-center">
                                     <img src={logoUrl} className="max-h-full max-w-full object-contain relative z-10" />
                                     <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full opacity-40 scale-75" />
                                     <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm rounded-xl">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Replace DNA</span>
                                     </div>
                                  </div>
                               ) : (
                                  <div className="flex flex-col items-center gap-3 opacity-30 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                                     <div className="h-14 w-14 rounded-full border border-dashed border-white/30 flex items-center justify-center">
                                        <Plus className="h-6 w-6" />
                                     </div>
                                     <span className="text-[9px] uppercase font-black tracking-[0.2em]">Initialize Logo</span>
                                  </div>
                               )}
                               <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-30" disabled={logoStatus === 'uploading'} title="" />
                            </div>
                          </ActionTooltip>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Favicon Asset (Browser Icon - 16x16)</label>
                          <ActionTooltip label={faviconStatus === 'error' ? `Error: ${faviconError}` : "Specify the browser tab iconography for this synthesis."}>
                            <div className={`h-24 w-24 rounded-2xl bg-white/5 border flex items-center justify-center relative overflow-hidden group transition-all cursor-pointer ${faviconStatus === 'error' ? 'border-red-500/50 bg-red-500/5' : faviconStatus === 'success' ? 'border-green-500/50 bg-green-500/5' : 'border-white/5 hover:border-primary/40'}`}>
                               {faviconStatus === 'uploading' ? (
                                  <RefreshCcw className="h-6 w-6 text-primary animate-spin" />
                               ) : faviconStatus === 'success' ? (
                                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                               ) : faviconStatus === 'error' ? (
                                  <AlertCircle className="h-6 w-6 text-red-500" />
                               ) : faviconUrl ? (
                                  <div className="relative h-full w-full flex items-center justify-center">
                                     <img src={faviconUrl} className="w-12 h-12 object-contain relative z-10" />
                                     <div className="absolute inset-0 bg-primary/10 blur-xl opacity-40" />
                                     <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm">
                                        <RefreshCcw className="h-4 w-4 text-primary" />
                                     </div>
                                  </div>
                               ) : (
                                  <ImageIcon className="h-8 w-8 opacity-30 group-hover:opacity-100 transition-all" />
                               )}
                               <input type="file" onChange={handleFaviconUpload} className="absolute inset-0 opacity-0 cursor-pointer z-30" disabled={faviconStatus === 'uploading'} title="" />
                            </div>
                          </ActionTooltip>
                       </div>
                    </div>
                  <div className="flex gap-3">
                    <ActionTooltip label="Return to project context.">
                      <Button variant="ghost" onClick={() => setCurrentStep(1)} className="h-14 px-6 border border-white/5 rounded-2xl text-[10px] uppercase font-bold tracking-widest"><ChevronLeft className="h-4 w-4 mr-2" /> Back</Button>
                    </ActionTooltip>
                    <ActionTooltip label="Advance to Atmosphere selection.">
                      <Button onClick={() => setCurrentStep(3)} className="flex-1 h-14 bg-primary text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-lg shadow-primary/20 group">
                        Atmosphere <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </ActionTooltip>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Visual Atmosphere */}
              {currentStep === 3 && (
                <motion.div 
                   key="step3" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                   className="space-y-8 pt-4"
                >
                  <div className="space-y-6">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center px-1">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Global Theme</label>
                          <button onClick={handleNeuralThemeSynthesis} className="text-[8px] text-primary font-black uppercase tracking-widest hover:underline">Neural Synth</button>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          {Object.values(PRESET_THEMES).map((theme) => (
                            <button 
                              key={theme.id}
                              onClick={() => { setActiveThemeId(theme.id); setActiveTab("themes"); }}
                              className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${activeThemeId === theme.id ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                            >
                               <div className="h-6 w-full rounded-lg" style={{ backgroundColor: theme.primary }} />
                               <span className="text-[8px] font-bold uppercase tracking-widest">{theme.label}</span>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">Typography Pairing</label>
                       <div className="space-y-2 max-h-[240px] overflow-y-auto no-scrollbar pr-1">
                          {Object.values(TYPOGRAPHY_PAIRINGS).map((pair) => (
                            <button 
                              key={pair.id}
                              onClick={() => { setActivePairingId(pair.id); setActiveTab("typography"); }}
                              className={`w-full p-4 rounded-2xl border text-left transition-all ${activePairingId === pair.id ? 'bg-primary/10 border-primary' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                            >
                               <div className="text-xs font-bold mb-1">{pair.label}</div>
                               <div className="text-[9px] text-muted-foreground opacity-50 uppercase tracking-widest truncate">{pair.heading.replace('var(--font-heading-', '').replace(')', '')}</div>
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <ActionTooltip label="Revert to Identity step.">
                      <Button variant="ghost" onClick={() => setCurrentStep(2)} className="h-14 px-6 border border-white/5 rounded-2xl text-[10px] uppercase font-bold tracking-widest"><ChevronLeft className="h-4 w-4 mr-2" /> Back</Button>
                    </ActionTooltip>
                    <ActionTooltip label="Proceed to Synthesis Labs.">
                      <Button onClick={() => setCurrentStep(4)} className="flex-1 h-14 bg-primary text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-lg shadow-primary/20 group">
                        Synthesis Labs <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </ActionTooltip>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Synthesis */}
              {currentStep === 4 && (
                <motion.div 
                   key="step4" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                   className="space-y-8 pt-4"
                >
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
                         <button onClick={() => setSubTab('templates')} className={`flex-1 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${subTab === 'templates' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}>Templates</button>
                         <button onClick={() => setSubTab('sections')} className={`flex-1 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${subTab === 'sections' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}>Sections</button>
                      </div>

                      {subTab === 'templates' ? (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                          {BUSINESS_TEMPLATES.map((tmpl) => (
                            <button key={tmpl.id} onClick={() => { setPrompt(tmpl.prompt); setStyle(tmpl.style); setFramework(tmpl.framework); }} className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 hover:bg-primary/5 text-left transition-all group">
                              <div className="text-[11px] font-bold mb-1 group-hover:text-primary">{tmpl.name}</div>
                              <p className="text-[9px] text-muted-foreground leading-relaxed">{tmpl.description}</p>
                            </button>
                          ))}
                        </div>
                       ) : (
                        <div className="space-y-4">
                           <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                              {Object.keys(CATEGORICAL_SECTIONS).map((cat) => (
                                 <button key={cat} onClick={() => setSelectedCategory(cat as any)} className={`px-4 py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest border transition-all ${selectedCategory === cat ? 'bg-primary text-white border-primary' : 'border-white/5 bg-white/5'}`}>{cat}</button>
                              ))}
                           </div>
                           <div className="space-y-2 max-h-[240px] overflow-y-auto no-scrollbar pr-1">
                              {CATEGORICAL_SECTIONS[selectedCategory].map((section: any) => (
                                 <button key={section.id} onClick={() => setNodes([ ...nodes, { ...section, id: `node-${Date.now()}` } ])} className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 flex justify-between items-center group transition-all">
                                    <span className="text-[10px] font-bold group-hover:text-primary">{section.name}</span>
                                    <Plus className="h-3 w-3 opacity-30 group-hover:opacity-100" />
                                 </button>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-3">
                       <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">AI Prompt Sequence</label>
                       <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe a custom node..." className="w-full h-24 bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] outline-none focus:border-primary/50 transition-all resize-none font-body" />
                       <Button onClick={handleGenerate} disabled={isGenerating || !prompt} className="w-full h-12 bg-accent text-black font-bold uppercase tracking-widest text-[9px] rounded-xl">
                          {isGenerating ? "Synthesizing..." : "Generate New Node"}
                       </Button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <ActionTooltip label="Return to Atmosphere settings.">
                      <Button variant="ghost" onClick={() => setCurrentStep(3)} className="h-14 px-6 border border-white/5 rounded-2xl text-[10px] uppercase font-bold tracking-widest"><ChevronLeft className="h-4 w-4 mr-2" /> Back</Button>
                    </ActionTooltip>
                    <ActionTooltip label="Proceed to Neural Tuning.">
                      <Button onClick={() => setCurrentStep(5)} className="flex-1 h-14 bg-primary text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-lg shadow-primary/20 group">
                        Visual Matrix <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </ActionTooltip>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Neural Tuning */}
              {currentStep === 5 && (
                <motion.div 
                   key="step5" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                   className="space-y-10 pt-4"
                >
                  <div className="space-y-8">
                    {[
                      { id: 'blur', label: "Canvas Blur", value: `${blurValue}px`, val: blurValue, onChange: setBlurValue, max: 64, icon: Wind, tooltip: "Adjust the radial diffusion of the neural workspace." },
                      { id: 'mesh', label: "Mesh Intensity", value: `${meshIntensity}%`, val: meshIntensity, onChange: setMeshIntensity, max: 100, icon: Sparkles, tooltip: "Synthesize background energy markers." },
                      { id: 'chroma', label: "Chroma Shift", value: `${chromaShift}°`, val: chromaShift, onChange: setChromaShift, max: 360, icon: RefreshCcw, tooltip: "Rotate the manifold's color spectrum." }
                    ].map((config) => (
                      <div key={config.id} className="space-y-4">
                        <div className="flex justify-between items-center group">
                          <ActionTooltip label={config.tooltip}>
                            <div className="flex items-center gap-3 cursor-help">
                               <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors"><config.icon className="h-4 w-4" /></div>
                               <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                            </div>
                          </ActionTooltip>
                          <span className="text-[10px] text-primary font-bold italic">{config.value}</span>
                        </div>
                        <ActionTooltip label={`Slide to adjust ${config.label.toLowerCase()}.`}>
                           <input type="range" min="0" max={config.max} value={config.val} onChange={(e) => config.onChange(parseInt(e.target.value))} className="w-full accent-primary h-1 bg-white/10 rounded-full outline-none cursor-pointer" />
                        </ActionTooltip>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <ActionTooltip label="Return to Synthesis Labs.">
                      <Button variant="ghost" onClick={() => setCurrentStep(4)} className="h-14 px-6 border border-white/5 rounded-2xl text-[10px] uppercase font-bold tracking-widest"><ChevronLeft className="h-4 w-4 mr-2" /> Back</Button>
                    </ActionTooltip>
                    <ActionTooltip label="Manage workspace assets.">
                      <Button onClick={() => setCurrentStep(6)} className="flex-1 h-14 bg-primary text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-lg shadow-primary/20 group">
                        Hypermedia <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </ActionTooltip>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Hypermedia (Gallery) */}
              {currentStep === 6 && (
                <motion.div 
                   key="step6" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                   className="space-y-10 pt-4"
                >
                  <div className="space-y-6">
                     <div className="space-y-4">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">Asset Overflow</label>
                        <div className="relative group">
                           <div className="h-32 rounded-3xl border-2 border-dashed border-white/10 group-hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3 bg-white/5 cursor-pointer overflow-hidden">
                              <ImageIcon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Upload Multiple Assets</span>
                              <input type="file" multiple onChange={handleMultiImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                           <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Manifest ({floatingAssets.length})</label>
                           {floatingAssets.length > 0 && (
                              <button onClick={() => setFloatingAssets([])} className="text-[8px] text-red-500 font-bold uppercase tracking-widest hover:underline">Flush All</button>
                           )}
                        </div>
                        <div className="grid grid-cols-4 gap-2 max-h-[240px] overflow-y-auto no-scrollbar pr-1">
                           {floatingAssets.map((asset) => (
                              <div key={asset.id} className="aspect-square rounded-xl bg-white/5 border border-white/5 relative group overflow-hidden">
                                 <img src={asset.url} className="w-full h-full object-cover p-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                                 <button onClick={() => handleDeleteAsset(asset.id)} className="absolute inset-0 flex items-center justify-center bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="h-3 w-3 text-white" />
                                 </button>
                              </div>
                           ))}
                           <div className="aspect-square rounded-xl border border-dashed border-white/10 flex items-center justify-center bg-white/5 opacity-40">
                              <Plus className="h-4 w-4" />
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <ActionTooltip label="Return to Neural Tuning.">
                      <Button variant="ghost" onClick={() => setCurrentStep(5)} className="h-14 px-6 border border-white/5 rounded-2xl text-[10px] uppercase font-bold tracking-widest"><ChevronLeft className="h-4 w-4 mr-2" /> Back</Button>
                    </ActionTooltip>
                    <ActionTooltip label="Proceed to Final Review.">
                      <Button onClick={() => setCurrentStep(7)} className="flex-1 h-14 bg-primary text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-lg shadow-primary/20 group">
                        Final Review <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </ActionTooltip>
                  </div>
                </motion.div>
              )}

              {/* Step 7: Completion */}
              {currentStep === 7 && (
                <motion.div 
                   key="step6" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                   className="space-y-10 pt-4"
                >
                  <div className="space-y-6">
                    <div className="p-6 glass-dark border border-white/5 rounded-[32px] space-y-6">
                       <h3 className="text-[10px] uppercase font-black tracking-widest text-center text-primary">Synthesis Metric HUD</h3>
                       <NeuralInsightHUD matrix={matrixData} />
                    </div>

                    <div className="space-y-3">
                       <Button onClick={handleExportStandalone} disabled={isExporting} className="w-full h-16 bg-accent text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-accent/10">
                          {isExporting ? "Pulsing Data..." : "Export Neural Build"}
                       </Button>
                       <Button variant="ghost" onClick={handleExportJSON} className="w-full h-12 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">Download Matrix Core (JSON)</Button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <Button variant="ghost" onClick={() => setCurrentStep(6)} className="w-full h-12 text-[10px] uppercase font-bold tracking-widest gap-2 text-muted-foreground hover:text-white transition-colors">
                      <CornerUpLeft className="h-4 w-4" /> Go back to Assets
                    </Button>
                    <Button variant="destructive" onClick={handleFlushCanvas} className="w-full bg-red-500/10 text-red-500 border-none h-12 uppercase font-bold tracking-widest text-[9px] rounded-xl hover:bg-red-500/20">
                      Flush Synthesis Core
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t border-white/5 relative z-10 bg-background/40 backdrop-blur-md">
             <ActionTooltip label="Exit Synthesis and return to the Command Dashboard.">
                <Link href="/dashboard" className="w-full h-12 glass border border-white/10 flex items-center justify-center gap-3 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                   <ChevronLeft className="h-4 w-4" /> Return to Command
                </Link>
             </ActionTooltip>
          </div>
        </aside>

        {/* Main Neural Canvas Area */}
        <main 
          className="flex-1 relative flex flex-col bg-background overflow-hidden" 
          style={{ 
            filter: `hue-rotate(${chromaShift}deg)`,
            '--canvas-blur': `${blurValue}px`,
            '--mesh-opacity': `${meshIntensity / 100}`
          } as any}
        >
          {/* Synthesis Rail (Universal Navigator) */}
          <div className="h-24 glass-dark border-b border-white/5 flex items-center px-10 relative z-40 bg-background/50 backdrop-blur-xl">
             <div className="flex items-center justify-between w-full max-w-[1400px] mx-auto">
                <div className="flex items-center gap-12">
                   {STEPS.map((step, idx) => {
                     const isActive = currentStep === step.id;
                     const isCompleted = currentStep > step.id;
                     const Icon = step.icon;
                     
                     return (
                       <ActionTooltip key={step.id} label={`${step.description}`}>
                         <div 
                           onClick={() => setCurrentStep(step.id)}
                           className={`flex items-center gap-3 cursor-pointer group relative transition-all ${isActive ? 'opacity-100 scale-105' : 'opacity-30 hover:opacity-100'}`}
                         >
                            <div className={`h-11 w-11 rounded-[1.25rem] flex items-center justify-center border transition-all duration-500 ${isActive ? 'bg-primary border-primary shadow-[0_0_30px_rgba(var(--primary),0.3)] text-white rotate-6' : isCompleted ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/5 text-muted-foreground'}`}>
                               {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />}
                            </div>
                            <div className="hidden xl:block">
                               <div className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{step.label}</div>
                               <div className="text-[10px] font-bold text-white/50">{step.title}</div>
                            </div>
                            {idx < STEPS.length - 1 && (
                              <div className="absolute -right-8 top-1/2 -translate-y-1/2 hidden 2xl:block">
                                 <div className="w-4 h-[1px] bg-white/10" />
                              </div>
                            )}
                            {isActive && (
                              <motion.div layoutId="railIndicator" className="absolute -bottom-6 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent blur-[1px]" />
                            )}
                         </div>
                       </ActionTooltip>
                     );
                   })}
                </div>

                <div className="flex items-center gap-6">
                   <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/40">Neural Integrity</span>
                      <span className="text-xs font-bold font-mono text-primary">{matrixData?.performance.score || 98}%</span>
                   </div>
                   <div className="h-8 w-[1px] bg-white/5" />
                   <ActionTooltip label="Toggle Isometric Visualization">
                      <Button variant="ghost" size="icon" onClick={() => setIsIsometric(!isIsometric)} className={`h-10 w-10 rounded-xl transition-all ${isIsometric ? 'bg-primary/20 text-primary border border-primary/20' : 'hover:bg-white/5 text-muted-foreground'}`}>
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                   </ActionTooltip>
                </div>
             </div>
          </div>

          <div className="flex-1 relative overflow-auto no-scrollbar scroll-smooth">
            <div className={`transition-all duration-1000 w-full min-h-full p-10 relative ${isIsometric ? 'perspective-isometry bg-primary/5' : ''}`}>
               {/* Effect Substrate (Background Mesh) */}
               <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="mesh-gradient" />
               </div>

               {/* Floating Asset Layer (Handled by Step 4/5 logic) */}
               {floatingAssets.map(asset => (
                  <FloatingAsset 
                    key={asset.id}
                    id={asset.id}
                    url={asset.url}
                    initialPos={{ x: asset.x, y: asset.y }}
                    initialSize={{ w: asset.w, h: asset.h }}
                    onUpdate={handleUpdateAsset}
                    onDelete={handleDeleteAsset}
                  />
               ))}
                     <div className="space-y-12 pb-64 relative">
                        {/* Persistent Neural Substrate (Always Visible) */}
                        <div className="flex justify-center items-center pointer-events-none mb-12">
                           <div className="relative h-96 w-96 flex items-center justify-center pointer-events-auto">
                              <div className="absolute inset-x-0 bottom-0 top-0 bg-primary/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
                              
                              <AnimatePresence>
                                {/* Cumulative Draggable Units */}
                                <WorkspaceAsset 
                                  id="asset-logo"
                                  isActive={activeOptionsId === 'asset-logo'}
                                  onToggle={() => setActiveOptionsId(activeOptionsId === 'asset-logo' ? null : 'asset-logo')}
                                  onDelete={() => { setLogoUrl(null); setLogoStatus('idle'); }}
                                  className="z-20"
                                >
                                     {(logoUrl || currentStep >= 2) ? (
                                        <div className="relative h-44 w-44 flex items-center justify-center">
                                           <div className="absolute inset-0 border border-primary/20 border-t-primary rounded-full animate-spin [animation-duration:3s]" />
                                           <div className="absolute inset-4 border border-primary/10 border-b-primary/50 rounded-full animate-spin [animation-direction:reverse] [animation-duration:5s]" />
                                           {logoStatus === 'error' ? (
                                              <AlertCircle className="h-12 w-12 text-red-500 animate-pulse" />
                                           ) : logoUrl ? (
                                              <img src={logoUrl} className="h-24 w-24 object-contain relative z-10" />
                                           ) : (
                                              <Sparkles className="h-12 w-12 text-primary/40 animate-pulse" />
                                           )}
                                        </div>
                                     ) : (
                                        <div className="h-40 w-40 rounded-3xl border border-primary/40 bg-primary/10 flex items-center justify-center animate-pulse">
                                           <Target className="h-20 w-20 text-primary" />
                                        </div>
                                     )}
                                </WorkspaceAsset>

                                {(activeThemeId || activePairingId) && (
                                   <WorkspaceAsset 
                                     id="asset-theme"
                                     isActive={activeOptionsId === 'asset-theme'}
                                     onToggle={() => setActiveOptionsId(activeOptionsId === 'asset-theme' ? null : 'asset-theme')}
                                     onDelete={() => { setActiveThemeId('sapphire'); setActivePairingId('modern'); }}
                                     className="z-30"
                                   >
                                      <motion.div initial={{ x: 200 }} animate={{ x: 240 }}>
                                         <div className="relative flex flex-col items-center gap-6">
                                            <div className="grid grid-cols-2 gap-2 p-4 h-40 w-40 glass rounded-[2.5rem] relative overflow-hidden border border-white/10 shadow-2xl">
                                               <div className="rounded-2xl animate-pulse" style={{ backgroundColor: (PRESET_THEMES as any)[activeThemeId]?.primary || '#ccc' }} />
                                               <div className="rounded-2xl [animation-delay:0.2s] animate-pulse" style={{ backgroundColor: (PRESET_THEMES as any)[activeThemeId]?.accent || '#888' }} />
                                               <div className="bg-white/10 rounded-2xl [animation-delay:0.4s] animate-pulse" />
                                               <div className="rounded-2xl [animation-delay:0.6s] animate-pulse opacity-50" style={{ backgroundColor: (PRESET_THEMES as any)[activeThemeId]?.primary || '#ccc' }} />
                                            </div>
                                            <div className="glass px-4 py-2 rounded-full border border-white/10 shadow-2xl backdrop-blur-md">
                                               <p className="text-[9px] text-primary font-mono tracking-widest uppercase">
                                                  {(PRESET_THEMES as any)[activeThemeId]?.label || 'Standard'} + {(TYPOGRAPHY_PAIRINGS as any)[activePairingId]?.label || 'Default'}
                                               </p>
                                            </div>
                                         </div>
                                      </motion.div>
                                   </WorkspaceAsset>
                                )}

                                {projectName && (
                                   <WorkspaceAsset 
                                     id="asset-name"
                                     isActive={activeOptionsId === 'asset-name'}
                                     onToggle={() => setActiveOptionsId(activeOptionsId === 'asset-name' ? null : 'asset-name')}
                                     onDelete={() => setProjectName("")}
                                     className="z-40"
                                   >
                                      <motion.div initial={{ y: -220 }} animate={{ y: -180 }}>
                                         <div className="glass px-6 py-3 rounded-2xl border border-primary/30 shadow-2xl backdrop-blur-md">
                                            <h3 className="text-xl font-heading font-black italic tracking-tight text-primary uppercase">{projectName}</h3>
                                            <p className="text-[8px] text-white/40 font-mono tracking-widest uppercase text-center mt-1">Project Foundation Synced</p>
                                         </div>
                                      </motion.div>
                                   </WorkspaceAsset>
                                )}
                              </AnimatePresence>
                           </div>
                        </div>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext items={nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
                            <AnimatePresence mode="popLayout">
                              {nodes.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center p-12 space-y-8 relative overflow-hidden group">
                                    <div className="space-y-6 flex flex-col items-center">
                                       <div className="glass px-8 py-4 rounded-3xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                                          <h3 className="text-2xl font-heading font-black italic tracking-tight text-white/90">Awaiting Synthesis Sequence</h3>
                                          <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto leading-relaxed italic">The neural manifold is receptive. Advance to Step 4 to begin component emission.</p>
                                       </div>
                                       
                                       {currentStep >= 4 && (
                                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                             <div className="flex flex-col items-center gap-4">
                                                <div className="h-24 w-24 rounded-3xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-2xl backdrop-blur-md">
                                                   <Cpu className="h-10 w-10 animate-pulse" />
                                                </div>
                                                <Button onClick={() => setCurrentStep(4)} variant="outline" className="h-10 px-6 border-primary/30 text-primary font-bold uppercase tracking-widest text-[8px] rounded-full hover:bg-primary/20 transition-all opacity-60 hover:opacity-100">
                                                   Activate Synthesis
                                                </Button>
                                             </div>
                                          </motion.div>
                                       )}
                                    </div>
                                </motion.div>
                              ) : (

                            nodes.map((node, i) => (
                              <SortableNode key={node.id} id={node.id} index={i} isIsometric={isIsometric}>
                                <motion.div 
                                  layout 
                                  initial={{ opacity: 0, y: 40 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }} 
                                  transition={{ type: "spring", damping: 25, stiffness: 120 }} 
                                  className="relative group/node"
                                >
                                  {/* Node Controls Overlay */}
                                   <BuilderNodeControls 
                                     node={node}
                                     isActive={activeSettingsNode === i}
                                     onToggleSettings={() => setActiveSettingsNode(activeSettingsNode === i ? null : i)}
                                     onDelete={() => setNodes(nodes.filter(n => n.id !== node.id))}
                                     onUpdate={(updates) => handleContentChange(i, updates)}
                                     onNeuralRescan={handleNeuralThemeSynthesis}
                                   />

                                  <RenderNode 
                                    node={node} 
                                    idx={i} 
                                    onContentChange={(updates) => handleContentChange(i, updates)} 
                                  />
                                </motion.div>
                              </SortableNode>
                            ))
                          )}
                        </AnimatePresence>
                      </SortableContext>
                    </DndContext>
               </div>
            </div>
          </div>
        </main>
      </div>

      <AriaCoPilot 
        onMutation={handleAriaMutation} 
        currentNodes={nodes} 
        evaluation={matrixData ? {
          a11y: matrixData.insights.filter((i: string) => i.toLowerCase().includes('a11y')).map((i: string) => ({ type: 'Accessibility', message: i })),
          seo: matrixData.insights.filter((i: string) => i.toLowerCase().includes('seo') || i.toLowerCase().includes('hierarchy')).map((i: string) => ({ type: 'SEO', message: i })),
          scores: {
            performance: matrixData.performance.score,
            accessibility: matrixData.a11y.score,
            seo: matrixData.seo.score
          }
        } : undefined}
        autonomy={autonomy}
        onClearAutonomy={autonomy.clearRecommendation}
      />
    </div>
  );
}
