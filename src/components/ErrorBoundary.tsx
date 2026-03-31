"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Neural Synthesis Error caught by Boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden font-body">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 blur-[120px] rounded-full" />
          
          <div className="max-w-md w-full glass p-10 rounded-[40px] border border-red-500/20 relative z-10 text-center space-y-8">
            <div className="h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto animate-pulse">
               <AlertCircle size={40} />
            </div>
            
            <div className="space-y-3">
               <h1 className="text-3xl font-heading font-bold italic tracking-tight text-white">Synthesis Interrupted</h1>
               <p className="text-muted-foreground text-sm leading-relaxed">
                  The neural canvas encountered a protocol desynchronization. The core matrix remains stable, but this specific node failed to materialize.
               </p>
               {this.state.error && (
                 <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-[10px] font-mono text-red-400 mt-4 text-left overflow-auto max-h-32">
                    {this.state.error.message}
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Button 
                 onClick={() => window.location.reload()} 
                 className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] gap-2 border border-white/10"
               >
                 <RefreshCcw size={14} /> Retry
               </Button>
               <Link href="/" className="w-full">
                 <Button 
                   className="w-full h-14 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-[10px] gap-2"
                 >
                    <Home size={14} /> Base
                 </Button>
               </Link>
            </div>
            
            <p className="text-[8px] uppercase tracking-widest text-muted-foreground/30 font-bold">
               Error reported to Neural Protocol Controller v4.0
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
