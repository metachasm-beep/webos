"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-2 md:py-4 border-t border-white/5 relative bg-background/50 backdrop-blur-3xl">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* Branding */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 group">
              <div className="h-8 w-8 flex items-center justify-center drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <img 
                  src="/assets/branding/icon.png" 
                  alt="WebOS AI Icon" 
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xl font-heading font-bold tracking-tight text-glow-soft">WebOS <span className="text-primary italic">AI</span></span>
            </div>
            <p className="hidden xl:block text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold border-l border-white/10 pl-4 ml-2">Audit. Build. Dominate.</p>
          </div>
          
          {/* Contacts & Links Grouped */}
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-muted-foreground/40 uppercase font-bold tracking-widest">E-mail</span>
              <span className="text-sm font-bold">info@turtlelabs.co.in</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-muted-foreground/40 uppercase font-bold tracking-widest">Registry</span>
              <div className="flex gap-6">
                <Link href="https://www.turtlelabs.co.in" target="_blank" className="text-xs text-muted-foreground hover:text-white transition-colors">Powered by Turtle Labs</Link>
                <div className="flex gap-4 border-l border-white/10 pl-4">
                  <Link href="/docs/privacy-policy" className="text-[10px] text-muted-foreground/60 hover:text-white transition-colors uppercase tracking-wider">Privacy</Link>
                  <Link href="/docs/terms-conditions" className="text-[10px] text-muted-foreground/60 hover:text-white transition-colors uppercase tracking-wider">Terms</Link>
                  <Link href="/docs/refund-policy" className="text-[10px] text-muted-foreground/60 hover:text-white transition-colors uppercase tracking-wider">Refund</Link>
                  <Link href="/docs/shopping-policy" className="text-[10px] text-muted-foreground/60 hover:text-white transition-colors uppercase tracking-wider">Shopping</Link>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-muted-foreground/40 uppercase font-bold tracking-widest">Social</span>
              <div className="flex gap-4">
                <Link href="https://x.com/turtlelabsindia" target="_blank" className="text-xs text-muted-foreground hover:text-white transition-colors">X</Link>
                <Link href="https://www.instagram.com/turtlelabs/" target="_blank" className="text-xs text-muted-foreground hover:text-white transition-colors">IG</Link>
                <Link href="https://www.linkedin.com/company/turtle-labs/" target="_blank" className="text-xs text-muted-foreground hover:text-white transition-colors">LI</Link>
                <Link href="https://medium.com/@turtlelabs" target="_blank" className="text-xs text-muted-foreground hover:text-white transition-colors">MD</Link>
              </div>
            </div>
          </div>

          {/* Copyright Inline */}
          <div className="text-[11px] text-muted-foreground/20 uppercase tracking-[0.4em] font-bold whitespace-nowrap">
            © 2026 WebOS AI
          </div>
        </div>
      </div>
    </footer>
  );
}
