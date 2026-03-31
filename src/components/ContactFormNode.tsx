"use client";

import React, { useState } from 'react';
import { Send, CheckCircle2, User, Mail, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactFormProps {
  node: {
    heading?: string;
    subheading?: string;
    accentColor?: string;
  };
}

export function ContactFormNode({ node }: ContactFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <section className="glass rounded-[40px] p-12 md:p-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
           <div className="space-y-4">
              <h2 className="text-5xl font-heading font-bold italic tracking-tight leading-tight">
                {node.heading || "Initiate Protocol Link"}
              </h2>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                {node.subheading || "Connect your neural core with our strategic growth matrix."}
              </p>
           </div>

           <div className="space-y-6">
              {[
                { icon: User, label: "Neural Identity", val: "Founder & CEO" },
                { icon: Mail, label: "Digital Vector", val: "hq@neuralmatrix.io" },
                { icon: MessageSquare, label: "Synthesis Uplink", val: "Active 24/7" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                   <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <item.icon className="h-5 w-5" />
                   </div>
                   <div>
                      <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60">{item.label}</div>
                      <div className="text-[11px] font-bold tracking-widest">{item.val}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="glass-dark border border-white/5 p-8 md:p-12 rounded-[32px] relative">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
               <motion.form 
                 key="form"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 onSubmit={handleSubmit} 
                 className="space-y-6"
               >
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Identity Vector</label>
                        <input required type="text" placeholder="Your Name" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 text-sm outline-none focus:border-primary/50 transition-all font-body" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Digital Frequency</label>
                        <input required type="email" placeholder="email@example.com" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 text-sm outline-none focus:border-primary/50 transition-all font-body" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Synthesis Payload</label>
                        <textarea required placeholder="Brief your mission objectives..." className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 p-6 text-sm outline-none focus:border-primary/50 transition-all font-body resize-none" />
                     </div>
                  </div>
                  <Button disabled={isLoading} className="w-full h-16 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                    {isLoading ? "Synchronizing..." : (
                      <>
                        Initiate Uplink
                        <Send className="ml-3 h-4 w-4" />
                      </>
                    )}
                  </Button>
               </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-6"
              >
                 <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto">
                    <CheckCircle2 className="h-10 w-10" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-heading font-bold italic">Link Established</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Our neural strategists have received your payload. We will initialize contact shortly.</p>
                 </div>
                 <Button variant="ghost" onClick={() => setIsSubmitted(false)} className="text-[10px] uppercase font-bold tracking-widest text-primary">Reset Protocol</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
