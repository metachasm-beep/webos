"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function SmartPricingNode({ node }: { node: any }) {
  const plans = [
    { name: "Starter Neural", price: "$29", desc: "For emerging founders.", features: ["3 Project Matrix", "Standard AI Synthesis", "Community Uplink"] },
    { name: "Growth Matrix", price: "$99", desc: "For scaling ventures.", features: ["Unlimited Projects", "Premium Neural Copilot", "Global Edge Deployment", "Priority Synthesis"], featured: true },
    { name: "Enterprise Core", price: "Custom", desc: "For massive infrastructures.", features: ["Neural Dedicated instances", "SLA Guarantee", "White-label Synthesis", "24/7 Neural Support"] }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4">
         <h2 className="text-4xl md:text-5xl font-heading font-bold italic tracking-tight uppercase">
           {node.heading || "Strategic Synthesis Pricing"}
         </h2>
         <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
           {node.subheading || "Transparent scaling for the next generation of digital empires."}
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card p-10 flex flex-col justify-between border ${plan.featured ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-white/5 bg-white/5'} transition-all hover:border-primary/50 group`}
          >
            <div className="space-y-8">
               <div className="space-y-2">
                  {plan.featured && (
                    <div className="flex items-center gap-2 mb-4">
                       <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Strategic Choice</span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
               </div>
               
               <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-heading font-bold italic">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground/60 text-xs uppercase font-bold tracking-widest">/mo</span>}
               </div>

               <div className="space-y-4 pb-12">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Features Registry</div>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <Check className="h-4 w-4 text-primary" />
                       <span className="text-sm text-foreground/80">{feat}</span>
                    </div>
                  ))}
               </div>
            </div>

            <Button className={`w-full h-14 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${plan.featured ? 'bg-primary text-white shadow-[0_0_30px_rgba(var(--primary),0.3)]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
               Initiate Link
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
