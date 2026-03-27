"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Layers, 
  MousePointer2, 
  Plus, 
  Settings2, 
  Type, 
  Image as ImageIcon, 
  Square,
  Eye,
  Rocket,
  Wand2,
  Undo2,
  Redo2,
  CheckCircle2,
  Moon,
  Box,
  Layout as LayoutIcon,
  Sparkles
} from "lucide-react";

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState("elements");

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar />
      
      {/* Futuristic Builder Toolbar */}
      <div className="h-16 border-b border-white/5 glass px-6 flex items-center justify-between mt-20 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 glass-dark border-white/5 hover:bg-white/10">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 bg-white/10" />
          </div>
          <div className="flex items-center gap-1.5 glass-dark rounded-full p-1 border-white/5">
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Undo2 className="h-3.5 w-3.5" /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Redo2 className="h-3.5 w-3.5" /></Button>
          </div>
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_oklch(var(--accent))]" />
             <span className="text-xs font-heading font-bold tracking-wider uppercase">V0.2 Alpha</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white">
            <Wand2 className="h-4 w-4 text-primary" />
            Neural AI
          </Button>
          <Separator orientation="vertical" className="h-6 bg-white/10" />
          <Button variant="ghost" size="sm" className="gap-2 text-primary hover:bg-primary/5 rounded-full border border-primary/20">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" className="gap-2 bg-primary text-white rounded-full px-6 shadow-xl shadow-primary/20 hover:bg-primary/80">
            <Rocket className="h-4 w-4" />
            Deploy Edge
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Elements/Components */}
        <aside className="w-80 border-r border-white/5 glass flex flex-col shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
            <TabsList className="w-full rounded-none h-14 grid grid-cols-2 glass-dark border-b border-white/5">
              <TabsTrigger value="elements" className="rounded-none font-heading font-bold tracking-widest text-[10px] uppercase data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all">Matrix</TabsTrigger>
              <TabsTrigger value="pages" className="rounded-none font-heading font-bold tracking-widest text-[10px] uppercase data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all">Nodes</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-10">
                <section>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Primitive Elements</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Type, label: "Typography" },
                      { icon: ImageIcon, label: "Visuals" },
                      { icon: MousePointer2, label: "Triggers" },
                      { icon: Box, label: "Cortex" }
                    ].map((el, i) => (
                      <motion.div 
                        whileHover={{ y: -2 }}
                        key={i} 
                        className="glass-dark border border-white/5 hover:border-primary/40 transition-colors p-4 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-grab group active:cursor-grabbing"
                      >
                         <el.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">{el.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Structural Layouts</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Bento Hero", icon: Sparkles },
                      { label: "Feature Grid", icon: LayoutIcon },
                      { icon: Layers, label: "Layered Stack" }
                    ].map((sec, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl glass-dark border border-white/5 hover:border-primary/20 cursor-pointer group transition-all">
                        <div className="flex items-center gap-3">
                           <sec.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                           <span className="text-xs font-bold uppercase tracking-widest">{sec.label}</span>
                        </div>
                        <Plus className="h-3 w-3 text-muted-foreground group-hover:rotate-90 transition-transform" />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </ScrollArea>
          </Tabs>
        </aside>

        {/* Builder Canvas */}
        <main className="flex-1 bg-black p-12 overflow-auto relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
          
          <div className="max-w-[1000px] mx-auto min-h-[1400px] glass border-white/5 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative group overflow-hidden">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
             
             <motion.div 
                initial={{ opacity: 0.3 }}
                whileHover={{ opacity: 1 }}
                className="text-center space-y-8 relative z-10 p-12"
             >
                <div className="h-24 w-24 rounded-full glass-dark flex items-center justify-center mx-auto mb-4 border-2 border-primary/20 relative">
                  <Wand2 className="h-10 w-10 text-primary animate-pulse" />
                  <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-heading font-bold italic">Neural Canvas</h2>
                  <p className="text-muted-foreground max-w-sm mx-auto text-sm font-body italic">"Design a futuristic SaaS landing page template with glassmorphism effects and deep space black theme."</p>
                </div>
                <div className="flex items-center gap-3 max-w-md mx-auto">
                   <Input 
                      placeholder="Describe the syntax of your vision..." 
                      className="h-14 glass-dark border-white/10 rounded-full px-8 text-sm focus-visible:ring-primary/20" 
                   />
                   <Button size="icon" className="h-14 w-14 rounded-full bg-primary hover:bg-primary/80 shrink-0 shadow-2xl shadow-primary/30">
                      <CheckCircle2 className="h-6 w-6" />
                   </Button>
                </div>
             </motion.div>
          </div>
        </main>

        {/* Right Sidebar - Properties/Settings */}
        <aside className="w-80 border-l border-white/5 glass shrink-0 overflow-y-auto hidden xl:flex flex-col">
          <div className="h-14 px-6 border-b border-white/5 flex items-center justify-between">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
              <Settings2 className="h-4 w-4 text-primary" />
              Matrix Config
            </h4>
          </div>
          
          <div className="p-8 space-y-12">
            <div className="space-y-6">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                Spatial Vectors
                <Layers className="h-3 w-3" />
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-widest">Dimension-X</label>
                  <Input defaultValue="100%" className="h-10 glass-dark border-white/5 text-[10px] font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-widest">Dimension-Y</label>
                  <Input defaultValue="Auto" className="h-10 glass-dark border-white/5 text-[10px] font-mono" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                Chroma Matrix
                <Moon className="h-3 w-3" />
              </h5>
              <div className="space-y-3">
                {[
                  { label: "Core Primary", hex: "#3B82F6", color: "bg-primary" },
                  { label: "Matrix Dark", hex: "#0B0B10", color: "bg-black" },
                  { label: "Cyber Mint", hex: "#10B981", color: "bg-accent" }
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl glass-dark border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`h-8 w-8 rounded-xl ${c.color} border border-white/10 shadow-lg`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{c.label}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-muted-foreground">{c.hex}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-dark rounded-3xl p-6 border border-white/5 space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Edge Sync</span>
                  <div className="h-2 w-2 rounded-full bg-accent animate-ping" />
               </div>
               <p className="text-[10px] text-muted-foreground leading-relaxed">System is synced with Vercel Edge network. All changes will be optimized in real-time.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
