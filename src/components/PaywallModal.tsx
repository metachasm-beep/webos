"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, FileText, CheckCircle2, Zap, Lock, Shield } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  auditUrl: string;
}

export function PaywallModal({ open, onClose, auditUrl }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const transactionId = "TXN_" + Date.now();

      const resp = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 299,
          transactionId,
          // redirectUrl is set server-side but we pass the audit url as metadata
          auditUrl,
        }),
      });

      const data = await resp.json();

      if (data?.data?.instrumentResponse?.redirectInfo?.url) {
        // PhonePe returns a redirect URL
        window.location.href = data.data.instrumentResponse.redirectInfo.url;
      } else if (data?.error) {
        setError("Payment gateway error: " + data.error);
      } else {
        // Fallback: no gateway configured — simulate success for dev
        setError(null);
        window.location.href = `/audit?url=${encodeURIComponent(auditUrl)}&payment=success`;
      }
    } catch (e: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass-card border-primary/20 overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 space-y-8 p-10">
              {/* Icon + Title */}
              <div className="space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-3xl font-heading font-bold italic tracking-tight">
                  Full Audit Report
                </h2>
                <p className="text-muted-foreground text-sm font-body leading-relaxed">
                  Get a detailed PDF with actionable fixes, priority scores, and a
                  month-by-month improvement roadmap.
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {[
                  "Detailed page-by-page breakdown",
                  "Prioritised fix list with difficulty ratings",
                  "SEO keyword opportunities",
                  "Shareable PDF — yours forever",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-body">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="glass-dark rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    One-time payment
                  </p>
                  <p className="text-4xl font-heading font-bold mt-1">
                    ₹299
                  </p>
                </div>
                <div className="flex items-center gap-2 text-green-500">
                  <Shield className="h-5 w-5" />
                  <span className="text-xs font-bold">Secure</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-400 text-xs font-bold">{error}</p>
              )}

              {/* CTA */}
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/80 font-bold uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 gap-3"
              >
                {loading ? (
                  "Redirecting to payment..."
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Pay ₹299 &amp; Download Report
                  </>
                )}
              </Button>

              <p className="text-center text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">
                Powered by PhonePe · UPI / Cards accepted
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
