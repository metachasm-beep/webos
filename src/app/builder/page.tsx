"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CheckCircle2
} from "lucide-react";

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState("elements");

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      
      {/* Builder Toolbar */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8"><Undo2 className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-8"><Redo2 className="h-4 w-4" /></Button>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
             <span className="text-xs font-medium text-muted-foreground">Draft:</span>
             <span className="text-xs font-bold">Main Landing Page</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            AI Remix
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" className="gap-2 shadow-lg shadow-primary/20 px-6">
            <Rocket className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Elements/Components */}
        <aside className="w-72 border-r bg-background flex flex-col shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full rounded-none h-12 grid grid-cols-2 bg-transparent border-b">
              <TabsTrigger value="elements" className="rounded-none data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary transition-none">Elements</TabsTrigger>
              <TabsTrigger value="pages" className="rounded-none data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary transition-none">Pages</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Basic Elements</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Type, label: "Text" },
                      { icon: ImageIcon, label: "Image" },
                      { icon: Plus, label: "Button" },
                      { icon: Square, label: "Container" }
                    ].map((el, i) => (
                      <Card key={i} className="group hover:border-primary/50 transition-colors cursor-pointer border-dashed">
                        <CardContent className="p-3 flex flex-col items-center justify-center gap-2">
                          <el.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                          <span className="text-[10px] font-medium">{el.label}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Sections</h4>
                  <div className="space-y-2">
                    {["Hero Section", "Features Grid", "Pricing Table", "Testimonials"].map((sec, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-md border border-dashed bg-muted/20 hover:bg-muted/40 cursor-pointer text-xs font-medium">
                        {sec}
                        <Plus className="h-3 w-3 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Tabs>
        </aside>

        {/* Builder Canvas */}
        <main className="flex-1 bg-muted/30 overflow-auto p-12">
          <div className="max-w-[1000px] mx-auto min-h-[1200px] bg-background shadow-2xl rounded-sm ring-1 ring-black/5 flex flex-col items-center justify-center border-dashed border-2 border-muted relative group">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center space-y-4 opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-bold">Start Building with AI</h2>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm italic">"Generate a modern SaaS landing page for an AI productivity tool with a hero section and a pricing table."</p>
                <div className="flex items-center gap-2 max-w-sm mx-auto">
                   <Input placeholder="Describe your landing page..." className="h-11 shadow-sm" />
                   <Button size="icon" className="h-11 w-11 shrink-0"><CheckCircle2 className="h-5 w-5" /></Button>
                </div>
             </div>
          </div>
        </main>

        {/* Right Sidebar - Properties/Settings */}
        <aside className="w-80 border-l bg-background shrink-0 overflow-y-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Properties
            </h4>
            <div className="flex items-center gap-1">
               <Button variant="ghost" size="icon" className="h-7 w-7"><MousePointer2 className="h-3 w-3" /></Button>
               <Button variant="ghost" size="icon" className="h-7 w-7"><Layers className="h-3 w-3" /></Button>
            </div>
          </div>
          
          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Layout</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground/60">Width</label>
                  <Input defaultValue="100%" className="h-8 text-xs font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground/60">Height</label>
                  <Input defaultValue="Auto" className="h-8 text-xs font-medium" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Colors</h5>
              <div className="flex items-center justify-between p-2 rounded-md border bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-primary border shadow-sm" />
                  <span className="text-xs font-medium">Primary</span>
                </div>
                <span className="text-[10px] font-mono font-medium text-muted-foreground">#2563EB</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md border bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-background border shadow-sm" />
                  <span className="text-xs font-medium">Background</span>
                </div>
                <span className="text-[10px] font-mono font-medium text-muted-foreground">#F8FAFC</span>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Spacing</h5>
              <div className="p-4 rounded-lg border bg-muted/5 flex items-center justify-center">
                <div className="w-full aspect-square border-2 border-dashed rounded-sm border-primary/20 relative flex items-center justify-center p-6">
                   <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary/40 tracking-tighter uppercase">Padding</div>
                   <div className="w-full h-full border-2 rounded-sm border-primary/40 flex items-center justify-center p-6">
                      <div className="text-[8px] font-bold text-primary/60 tracking-tighter uppercase">Content</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
