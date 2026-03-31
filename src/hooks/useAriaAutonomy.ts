"use client";

import { useState, useEffect, useCallback } from "react";

interface AutonomyState {
  isPulsing: boolean;
  recommendation: string | null;
  lastPulse: Date | null;
  plan: any[] | null; // Multi-mutation plan
}

export function useAriaAutonomy(nodes: any[], matrixData: any) {
  const [state, setState] = useState<AutonomyState>({
    isPulsing: false,
    recommendation: null,
    lastPulse: null,
    plan: null,
  });

  const triggerPulse = useCallback(async () => {
    if (nodes.length === 0) return;
    
    setState(s => ({ ...s, isPulsing: true }));
    
    try {
      // Aria Synthesizes the Matrix...
      // We simulate a strategic reasoning step here or call a specialized API
      const response = await fetch("/api/builder/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Aria, conduct a Strategic Neural Pulse check on the current site state.",
          context: {
            nodes,
            scores: matrixData ? {
              performance: matrixData.performance.score,
              accessibility: matrixData.a11y.score,
              seo: matrixData.seo.score
            } : null,
            insights: matrixData?.insights || []
          }
        })
      });
      
      const data = await response.json();
      if (data.mutations && data.mutations.length > 0) {
        setState({
          isPulsing: false,
          recommendation: "Aria has identified a conversion roadblock. Proposing a Strategic Reorder.",
          lastPulse: new Date(),
          plan: data.mutations
        });
      } else {
         setState(s => ({ ...s, isPulsing: false, lastPulse: new Date() }));
      }
    } catch (err) {
      console.error("Neural Pulse Interrupted.");
      setState(s => ({ ...s, isPulsing: false }));
    }
  }, [nodes, matrixData]);

  useEffect(() => {
    // Initial delay, then pulse every 60s
    const timer = setTimeout(() => {
      triggerPulse();
    }, 10000); // 10s after mount

    const interval = setInterval(triggerPulse, 60000); // Every 1 min
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [triggerPulse]);

  return {
    ...state,
    clearRecommendation: () => setState(s => ({ ...s, recommendation: null, plan: null })),
    triggerPulse
  };
}
