"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, X, Send, Command } from 'lucide-react';
import { Button } from './ui/button';

interface AriaCoPilotProps {
  onMutation: (commands: any[]) => void;
  currentNodes: any[];
  evaluation?: {
    a11y: any[];
    seo: any[];
    scores: { performance: number; accessibility: number; seo: number };
  };
}

export function AriaCoPilot({ onMutation, currentNodes, evaluation }: AriaCoPilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    setIsTyping(true);
    try {
      const resp = await fetch("/api/builder/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message, 
          context: { 
            nodes: currentNodes,
            evaluation: evaluation
          } 
        })
      });
      const { mutations } = await resp.json();
      if (mutations && mutations.length > 0) {
        onMutation(mutations);
      }
      setMessage("");
    } catch (err) {
      console.error("Aria Protocol Sync Failure.", err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-12 right-12 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-6 w-[400px] glass-card overflow-hidden shadow-2xl p-0"
          >
            <div className="bg-primary/20 p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary">Neural Co-Pilot / Aria</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 rounded-full hover:bg-white/10"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="h-[300px] p-6 overflow-y-auto space-y-4 font-body">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                     <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none">
                     <p className="text-[11px] leading-relaxed italic text-muted-foreground">
                        Neural Co-Pilot online. I am monitoring your canvas for performance and accessibility violations. How can I assist with your synthesis today?
                     </p>
                  </div>
               </div>

               {evaluation && (evaluation.a11y.length > 0 || evaluation.seo.length > 0) && (
                 <div className="space-y-3">
                   <div className="flex items-center gap-2 px-2">
                     <div className="h-[1px] flex-1 bg-white/5" />
                     <span className="text-[8px] font-bold uppercase tracking-widest text-primary/40">Strategic Flaws Detected</span>
                     <div className="h-[1px] flex-1 bg-white/5" />
                   </div>
                   
                   {[...evaluation.a11y, ...evaluation.seo].slice(0, 3).map((issue, idx) => (
                     <div key={idx} className="glass-card p-3 border-primary/20 bg-primary/5 flex items-start justify-between gap-3 group/item">
                       <div className="space-y-1">
                         <div className="text-[9px] font-bold uppercase tracking-widest text-primary">{issue.type} Issue</div>
                         <div className="text-[10px] text-foreground/80 leading-tight">{issue.message}</div>
                       </div>
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => setMessage(`Fix this ${issue.type} issue: ${issue.message}`)}
                         className="h-7 px-2 text-[8px] border-primary/30 hover:bg-primary/20 text-primary font-bold uppercase tracking-widest flex items-center gap-2"
                       >
                         Sync Fix <Command className="h-2 w-2" />
                       </Button>
                     </div>
                   ))}
                 </div>
               )}
               
               {isTyping && (
                 <div className="flex gap-2 p-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                 </div>
               )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-white/5 flex gap-2">
               <input 
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 placeholder="Type your command..."
                 className="flex-1 bg-transparent border-none outline-none text-[11px] px-2 h-10 font-body placeholder:text-muted-foreground/30"
               />
               <Button 
                 type="submit"
                 disabled={!message.trim() || isTyping}
                 className="h-10 w-10 p-0 rounded-xl bg-primary text-white"
               >
                 <Send className="h-4 w-4" />
               </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 rounded-[24px] bg-primary shadow-[0_0_40px_rgba(var(--primary),0.3)] flex items-center justify-center text-white relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageCircle className="h-7 w-7" />
        {!isOpen && (
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-accent rounded-full border-2 border-black animate-bounce" />
        )}
      </motion.button>
    </div>
  );
}
