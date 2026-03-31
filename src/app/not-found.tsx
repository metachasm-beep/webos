"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { NeuralBackground } from "@/components/NeuralBackground";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
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
             <div className="absolute inset-0 bg-red-500/20 blur-3xl animate-pulse" />
             <AlertCircle className="h-20 w-20 text-red-500 mx-auto relative z-10" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-6xl font-heading font-black italic tracking-tighter">404</h1>
            <p className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">Matrix Desynchronized</p>
            <h2 className="text-xl font-heading font-bold text-white/90">Navigation Node Not Found</h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-[200px] mx-auto">
              The coordinate you requested does not exist within the current synthesis. 
            </p>
          </div>

          <Link href="/">
            <Button className="w-full h-14 bg-primary hover:bg-primary/80 text-white rounded-2xl shadow-xl shadow-primary/20 font-bold uppercase tracking-widest text-xs gap-3 mt-4">
              <ArrowLeft className="h-4 w-4" />
              Return to Base
            </Button>
          </Link>
        </motion.div>
      </main>
      
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)]" />
    </div>
  );
}
