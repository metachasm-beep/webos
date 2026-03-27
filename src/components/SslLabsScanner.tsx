"use client";

import { useEffect, useState, useRef } from "react";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SslLabsScanner({ url }: { url: string }) {
  const [grade, setGrade] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("Initializing scan...");
  const [loading, setLoading] = useState(true);
  const isPolling = useRef(false);

  useEffect(() => {
    let hostname = url;
    try { 
      hostname = /^https?:\/\//i.test(url) ? new URL(url).hostname : new URL(`https://${url}`).hostname; 
    } catch(e){}
    
    if (isPolling.current) return;
    isPolling.current = true;

    const poll = async (startNew = false) => {
      try {
        const endpoint = `https://api.ssllabs.com/api/v3/analyze?host=${hostname}${startNew ? "&startNew=on" : "&fromCache=on&maxAge=24"}`;
        const r = await fetch(endpoint);
        const data = await r.json();

        if (data.status === "READY" || data.status === "ERROR") {
          if (data.endpoints && data.endpoints.length > 0) {
            setGrade(data.endpoints[0].grade || "F");
            setStatusMsg("Grade available");
          } else {
            setGrade("N/A");
            setStatusMsg("No SSL endpoints found.");
          }
          setLoading(false);
          return;
        }

        if (data.status === "DNS" || data.status === "IN_PROGRESS") {
          setStatusMsg("Deep scanning certificates...");
          setTimeout(() => poll(false), 5000);
          return;
        }

        // If not cached and not in progress, start a new scan
        setStatusMsg("Warming up scanner...");
        setTimeout(() => poll(true), 1500);

      } catch (err) {
        setGrade("ERR");
        setStatusMsg("Scanner unreachable.");
        setLoading(false);
      }
    };

    poll();

    return () => { isPolling.current = false; };
  }, [url]);

  const getGradeColor = (g: string) => {
    if (!g) return "text-muted-foreground";
    if (g.startsWith("A")) return "text-green-500";
    if (g.startsWith("B")) return "text-blue-500";
    if (g.startsWith("C")) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="glass-card p-6 border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all">
      <div className="absolute top-0 right-0 p-6 opacity-10">
         {grade?.startsWith("A") ? <ShieldCheck className="h-24 w-24 text-green-500" /> : <ShieldAlert className="h-24 w-24 text-primary" />}
      </div>
      
      <div className="flex gap-4 items-start relative z-10">
        <div className="p-3 bg-white/5 rounded-2xl">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h4 className="font-heading font-bold text-xl mb-1">Qualys SSL Security</h4>
          <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-[200px]">
            Enterprise-grade deep analysis of SSL/TLS certificate configuration.
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Server Grade</p>
          <p className="text-xs text-muted-foreground/50 animate-pulse">{statusMsg}</p>
        </div>
        
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="grade"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className={`text-6xl font-heading font-black italic tracking-tighter ${getGradeColor(grade!)} text-glow-soft`}
            >
              {grade}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
