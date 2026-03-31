"use client"; // v1.0.1-branding-final

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Zap } from "lucide-react";

export function ContactForm() {
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    // Simulation of matrix synchronization
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setPending(false);
    alert("Protocol Synchronized. WebOS AI strategist will initiate contact shortly.");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <div className="space-y-8">
        <div className="space-y-4">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-5xl font-heading font-bold italic tracking-tighter"
          >
            SYNCHRONIZE <br />
            <span className="text-primary text-glow-soft">WITH WEBOS AI</span>
          </motion.h2>
          <p className="text-muted-foreground font-body leading-relaxed max-w-md">
            The growth matrix is expanding. Connect with our core infrastructure to accelerate your digital footprint.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-6 group">
            <div className="h-12 w-12 rounded-2xl glass-dark flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Mail className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol Email</p>
              <p className="font-heading font-bold">hello@webos-ai.com</p>
            </div>
          </div>

          <div className="flex items-center gap-6 group">
            <div className="h-12 w-12 rounded-2xl glass-dark flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Phone className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Direct Uplink</p>
              <p className="font-heading font-bold">+91 6309052625</p>
            </div>
          </div>

          <div className="flex items-center gap-6 group">
            <div className="h-12 w-12 rounded-2xl glass-dark flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Neural Hub</p>
              <p className="font-heading font-bold text-sm">Medak, Telangana, India - 502032</p>
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="glass-card p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8">
           <Zap className="h-20 w-20 text-primary/5 rotate-12" />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Identity</label>
              <Input 
                placeholder="Full Name" 
                className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-primary/50 transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Uplink</label>
              <Input 
                type="email" 
                placeholder="email@domain.com" 
                className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-primary/50 transition-colors"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Mission Intel</label>
            <Textarea 
              placeholder="Describe your enterprise growth requirements..." 
              className="bg-white/5 border-white/10 rounded-xl min-h-[120px] focus:border-primary/50 transition-colors"
              required
            />
          </div>

          <Button 
            disabled={pending}
            type="submit" 
            className="w-full h-14 bg-primary hover:bg-primary/80 text-white rounded-xl shadow-2xl shadow-primary/20 font-bold uppercase tracking-[0.2em] text-[10px]"
          >
            {pending ? "SYNCHRONIZING..." : "INITIATE PROTOCOL"}
            <Send className="ml-3 h-3 w-3" />
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
