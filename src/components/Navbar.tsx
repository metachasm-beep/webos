"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rocket, ShieldCheck, Zap, Menu } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4"
    >
      <div className="glass rounded-full px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Zap className="h-5 w-5 text-primary-foreground fill-current" />
          </div>
          <span className="text-xl font-heading font-bold tracking-tight text-glow">Web<span className="text-primary">OS</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Audit", href: "/#audit" },
            { label: "Builder", href: "/builder" },
            { label: "Features", href: "/#features" }
          ].map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground">
            Log In
          </Button>
          <Button size="sm" className="rounded-full bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20 gap-2">
            Get Started
            <Rocket className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
