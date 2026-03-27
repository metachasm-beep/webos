"use client";

import { motion } from "framer-motion";
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
  Trash2
} from "lucide-react";

import { useState } from "react";

export default function BuilderPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    try {
      const resp = await fetch("/api/builder/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
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
  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <Navbar />
      <div className="mesh-gradient opacity-30" />
      
      <div className="flex-1 flex pt-24">
        {/* Primitives Panel */}
        <aside className="w-80 glass border-r border-white/5 flex flex-col relative z-10">
          <div className="p-8 border-b border-white/5 space-y-1">
            <h2 className="text-xl font-heading font-bold italic tracking-tight">Neural Canvas</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Node Genesis Protocol</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Genesis Protocol</h3>
              <form onSubmit={handleGenerate} className="space-y-3">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your enterprise node..."
                  className="w-full h-32 glass-dark border border-white/10 rounded-2xl p-4 text-xs font-body focus:border-primary/50 outline-none transition-colors"
                />
                <Button 
                  type="submit" 
                  disabled={isGenerating}
                  className="w-full rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest h-12 shadow-2xl shadow-primary/20"
                >
                  {isGenerating ? "Synthesizing..." : "Initialize Genesis"}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">Synthesis Agents</h3>
              <div className="space-y-2">
                {[
                  { icon: Sparkles, label: "AI Generator", desc: "Synthesize section via natural language" },
                  { icon: Type, label: "Typography", desc: "Global font matrix control" },
                  { icon: ImageIcon, label: "Asset Lab", desc: "Neural image generation" }
                ].map((item, i) => (
                  <div key={i} className="glass-dark border border-white/5 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Neural Canvas Workspace */}
        <main className="flex-1 bg-black/20 relative p-12 overflow-y-auto z-0">
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
                  <Button variant="outline" className="rounded-full border-white/10 text-xs px-6 hover:bg-white/5">Export JSON</Button>
                  <Button className="rounded-full bg-primary text-white text-xs px-8 shadow-2xl shadow-primary/20">Sync Matrix</Button>
               </div>
            </div>

            {/* Simulated Glass Website Section */}
            <div className="space-y-12">
              {nodes.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={i}
                    className={`glass-card p-12 relative overflow-hidden group border-white/10 ${node.visualData?.variant === 'neon' ? 'shadow-[0_0_50px_rgba(59,130,246,0.1)]' : ''}`}
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-full text-red-500 hover:bg-red-500/10" onClick={() => setNodes(nodes.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="h-1 w-12 bg-primary rounded-full" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">{node.type} node</span>
                      </div>
                      <h2 className="text-5xl font-heading font-bold italic tracking-tight">{node.heading}</h2>
                      <p className="text-muted-foreground max-w-xl font-body leading-relaxed">{node.subheading}</p>
                      <Button className="rounded-full px-10 h-14 bg-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20">
                        {node.ctaText}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Global Config Panel */}
        <aside className="w-80 glass border-l border-white/5 p-8 space-y-12 relative z-10">
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">Matrix Config</h3>
            <div className="space-y-6">
              {[
                { label: "Backdrop Blur", value: "32px", percent: 80 },
                { label: "Mesh Intensity", value: "0.15", percent: 15 },
                { label: "Chroma Shift", value: "None", percent: 0 }
              ].map((config, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between text-[11px] font-bold font-body">
                    <span className="text-muted-foreground uppercase tracking-widest">{config.label}</span>
                    <span className="text-primary">{config.value}</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${config.percent}%` }}
                      className="h-full bg-primary rounded-full" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-6">
             <div className="p-6 glass-dark border border-white/5 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                   <Sparkles className="h-5 w-5 text-accent" />
                   <span className="text-xs font-bold uppercase tracking-widest italic">AI Suggestions</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Consider increasing contrast on your CTA node for higher conversion synaptic flow.</p>
                <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5 p-0 text-left justify-start gap-3 mt-2">
                   Apply Heuristic <ChevronRight className="h-3 w-3" />
                </Button>
             </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8">
             <Button variant="destructive" className="w-full rounded-2xl gap-3 text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none shadow-none font-bold uppercase tracking-widest">
                <Trash2 className="h-4 w-4" />
                Flush Sequence
             </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
