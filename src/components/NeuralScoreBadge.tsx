"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  AlertCircle, 
  TrendingUp,
  Info
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface NeuralScoreProps {
  score: number;
  label: string;
  trend?: "up" | "down" | "neutral";
  category: "Performance" | "A11y" | "SEO" | "Conversion";
  insights?: string[];
}

export function NeuralScoreBadge({ score, label, trend, category, insights }: NeuralScoreProps) {
  const getColor = (s: number) => 
    s >= 90 ? "text-emerald-400" : s >= 70 ? "text-primary" : "text-orange-400";
    
  const getBg = (s: number) => 
    s >= 90 ? "bg-emerald-500/10" : s >= 70 ? "bg-primary/10" : "bg-orange-500/10";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`glass-dark border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all group cursor-help`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-xl ${getBg(score)} flex items-center justify-center ${getColor(score)} transition-colors`}>
                {category === "Performance" && <Zap className="h-4 w-4" />}
                {category === "SEO" && <Activity className="h-4 w-4" />}
                {category === "A11y" && <ShieldCheck className="h-4 w-4" />}
                {category === "Conversion" && <Sparkles className="h-4 w-4" />}
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{category}</p>
                <div className="flex items-center gap-2">
                   <span className="text-sm font-heading font-bold italic tracking-tight">{label}</span>
                   {trend === "up" && <TrendingUp className="h-2.5 w-2.5 text-emerald-400 opacity-50" />}
                </div>
              </div>
            </div>
            
            <div className="text-right">
               <span className={`text-xl font-heading font-bold italic ${getColor(score)}`}>{score}%</span>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" className="w-64 bg-black border border-white/10 p-4 space-y-3">
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" />
              Aria Insight Logic
           </div>
           {insights && insights.length > 0 ? (
             <ul className="space-y-3">
               {insights.map((insight, i) => (
                 <li key={i} className="flex gap-2 text-[10px] text-muted-foreground leading-relaxed italic border-l border-white/10 pl-3">
                    {insight}
                 </li>
               ))}
             </ul>
           ) : (
             <p className="text-[10px] text-muted-foreground italic">Neural sequence is optimal. No active conflicts detected.</p>
           )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function NeuralInsightHUD({ matrix }: { matrix: any }) {
  if (!matrix) return null;

  return (
    <div className="space-y-3">
      <NeuralScoreBadge 
        category="Performance" 
        score={matrix.performance?.score || 0} 
        label={matrix.performance?.label || "Calculating"} 
        trend="up" 
      />
      <NeuralScoreBadge 
        category="SEO" 
        score={matrix.seo?.score || 0} 
        label={matrix.seo?.label || "Awaiting Scan"} 
        trend="up" 
      />
      <NeuralScoreBadge 
        category="A11y" 
        score={matrix.a11y?.score || 0} 
        label={matrix.a11y?.label || "Checking"} 
        trend="up" 
        insights={matrix.insights}
      />
    </div>
  );
}
