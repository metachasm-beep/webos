"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface ApiStatus {
  name: string;
  ok: boolean;
  label: string;
  description: string;
}

export function ApiStatusPanel() {
  const [statuses, setStatuses] = useState<ApiStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/status");
      const data = await r.json();
      setStatuses(data.apis);
      setLastChecked(new Date());
    } catch {
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  return (
    <div className="glass-card border-white/5 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            API Status
          </p>
          {lastChecked && (
            <p className="text-[9px] text-muted-foreground/40 mt-0.5">
              {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="h-7 w-7 rounded-full hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* API Rows */}
      <div className="space-y-3">
        {loading && statuses.length === 0
          ? [1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <div className="h-2 rounded bg-white/10 flex-1" />
              </div>
            ))
          : statuses.map((api, i) => (
              <motion.div
                key={api.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3"
              >
                {/* LED */}
                <div className="mt-0.5 relative shrink-0">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      api.ok ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  {/* Pulse ring */}
                  {api.ok && (
                    <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-40" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground leading-none">{api.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{api.description}</p>
                </div>

                {/* Badge */}
                <span
                  className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    api.ok
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {api.label}
                </span>
              </motion.div>
            ))}
      </div>
    </div>
  );
}
