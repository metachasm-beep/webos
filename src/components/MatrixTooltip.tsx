"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Zap, Shield, Activity, Fingerprint } from "lucide-react";

interface MatrixTooltipProps {
  children: React.ReactNode;
  label: string;
  description: string;
  technicalNarrative: string;
  type?: "performance" | "security" | "seo" | "ux";
}

export function MatrixTooltip({ 
  children, 
  label, 
  description, 
  technicalNarrative,
  type = "performance" 
}: MatrixTooltipProps) {
  const getIcon = () => {
    switch (type) {
      case "performance": return <Zap className="h-4 w-4 text-orange-500" />;
      case "security": return <Shield className="h-4 w-4 text-green-500" />;
      case "seo": return <Fingerprint className="h-4 w-4 text-accent" />;
      case "ux": return <Activity className="h-4 w-4 text-primary" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getColorClass = () => {
    switch (type) {
      case "performance": return "border-orange-500/20 text-orange-500";
      case "security": return "border-green-500/20 text-green-500";
      case "seo": return "border-accent/20 text-accent";
      case "ux": return "border-primary/20 text-primary";
      default: return "border-white/10 text-muted-foreground";
    }
  };

  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          sideOffset={8}
          className="p-0 border-none bg-transparent shadow-none w-80"
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`glass-dark border ${getColorClass()} p-6 rounded-2xl relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              {getIcon()}
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-white/5`}>
                  {getIcon()}
                </div>
                <h4 className="text-[12px] font-bold uppercase tracking-[0.2em]">{label} Protocol</h4>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-foreground/80 leading-relaxed font-body">
                  {description}
                </p>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Logic-Driven Narrative</p>
                  <p className="text-[10px] text-primary italic leading-relaxed font-body">
                    {technicalNarrative}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">Neural Link Active</span>
              </div>
            </div>
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
