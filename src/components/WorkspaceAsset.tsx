"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceAssetProps {
  id: string;
  children: React.ReactNode;
  onDelete?: () => void;
  isActive: boolean;
  onToggle: () => void;
  className?: string;
  drag?: boolean;
}

export function WorkspaceAsset({ 
  id, 
  children, 
  onDelete, 
  isActive, 
  onToggle, 
  className = "",
  drag = true
}: WorkspaceAssetProps) {
  return (
    <motion.div 
      drag={drag}
      dragMomentum={false} 
      initial={{ opacity: 0, scale: 0.8 }} 
      animate={{ opacity: 1, scale: 1 }} 
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`absolute cursor-move ${className}`}
    >
      <div className="relative group">
        {children}
        
        <AnimatePresence>
          {isActive && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 z-[100]"
            >
              <div className="glass px-4 py-2 rounded-full border border-white/10 shadow-2xl flex items-center gap-2">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 text-red-500/50 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-all border-none" 
                   onClick={(e) => {
                     e.stopPropagation();
                     onDelete?.();
                   }}
                 >
                   <Trash2 className="h-4 w-4" />
                 </Button>
                 <div className="h-4 w-[1px] bg-white/10" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-primary px-2">Draggable Unit</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
