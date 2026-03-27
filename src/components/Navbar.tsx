"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rocket, ShieldCheck, Zap, Menu, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4"
    >
      <div className="glass rounded-3xl px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <Zap className="h-6 w-6 text-primary-foreground fill-current" />
          </div>
          <span className="text-2xl font-heading font-bold tracking-tight text-glow-soft">Web<span className="text-primary italic">OS</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {[
            { label: "Audit", href: "/#audit" },
            { label: "Builder", href: "/builder" },
            { label: "Features", href: "/#features" }
          ].map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              className="text-[13px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-all relative group"
            >
              {link.label}
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary rounded-full transition-all group-hover:w-4" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full border border-white/10 overflow-hidden glass-dark flex items-center justify-center">
                {session.user?.image ? (
                  <img src={session.user.image} alt="User" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-full hover:bg-white/5"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:flex text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
              onClick={() => signIn("google")}
            >
              Sign In
            </Button>
          )}
          
          <Button size="sm" className="rounded-full bg-primary hover:bg-primary/80 px-8 h-10 text-white shadow-xl shadow-primary/20 gap-3 font-bold text-xs uppercase tracking-widest">
            Launch Engine
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
