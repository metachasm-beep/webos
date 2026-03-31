"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { NeuralBackground } from "@/components/NeuralBackground";
import { Zap, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <Navbar />
      <NeuralBackground />
      
      <main className="flex-1 flex items-center justify-center p-6 mt-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card border-white/5 text-center space-y-8 p-12"
        >
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
             <Zap className="h-20 w-20 text-primary mx-auto relative z-10" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-heading font-black italic tracking-tighter">SYNTHESIS HALTED</h1>
            <p className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">Error Trace: {error.digest || "Neural Core Interrupt"}</p>
            <h2 className="text-xl font-heading font-bold text-white/90">Critical Node Failure</h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-[250px] mx-auto">
              The platform encountered a structural anomaly during processing. 
            </p>
          </div>

          <Button 
            onClick={reset}
            className="w-full h-14 bg-primary hover:bg-primary/80 text-white rounded-2xl shadow-xl shadow-primary/20 font-bold uppercase tracking-widest text-xs gap-3 mt-4"
          >
            <RefreshCcw className="h-4 w-4" />
            Resume Protocol
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
