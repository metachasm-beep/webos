"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Settings2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BuilderNodeControlsProps {
  onDelete: () => void;
  onUpdate: (updates: any) => void;
  onNeuralRescan: () => void;
  node: any;
  isActive: boolean;
  onToggleSettings: () => void;
}

export function BuilderNodeControls({ 
  onDelete, 
  onUpdate, 
  onNeuralRescan, 
  node, 
  isActive, 
  onToggleSettings 
}: BuilderNodeControlsProps) {
  return (
    <div className="absolute -left-20 top-0 h-full flex flex-col items-center gap-3 opacity-0 group-hover/node:opacity-100 transition-all duration-500 translate-x-4 group-hover/node:translate-x-0 z-50">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-10 w-10 text-red-500/50 hover:text-red-500 rounded-2xl glass hover:bg-red-500/10 border-none transition-all" 
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-10 w-10 rounded-2xl glass border-none transition-all ${isActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'text-primary hover:bg-primary/20'}`} 
          onClick={onToggleSettings}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
        
        <AnimatePresence>
          {isActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: -10 }} 
              animate={{ opacity: 1, scale: 1, x: 0 }} 
              exit={{ opacity: 0, scale: 0.9, x: -10 }}
              className="absolute right-full mr-4 top-0 w-64 glass border border-white/10 rounded-3xl p-6 shadow-2xl z-[100] text-left space-y-4"
            >
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Neural Tuning</h4>
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Active Synthesis Parameters</p>
              </div>
              <div className="h-[1px] bg-white/5 w-full" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Visual Variant</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Standard', 'Neon', 'Glass', 'Minimal'].map((v) => (
                      <button 
                        key={v}
                        onClick={() => {
                          onUpdate({ visualData: { ...node.visualData, variant: v.toLowerCase() } });
                        }}
                        className={`py-2 rounded-xl text-[7px] font-bold uppercase tracking-widest border transition-all ${node.visualData?.variant === v.toLowerCase() ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-muted-foreground'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Atmosphere Sync</label>
                  <button 
                    onClick={() => {
                      onNeuralRescan();
                      onToggleSettings();
                    }}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all group"
                  >
                    <RefreshCcw className="h-2 w-2 group-hover:rotate-180 transition-transform duration-500" />
                    Aria re-scan
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
