import Link from "next/link";
import { Zap, Truck, Mail, Clock, AlertCircle } from "lucide-react";

export default function ShoppingPolicyPage() {
  const policies = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Fast Processing",
      text: "All orders are processed within 1–2 business days to ensure rapid delivery."
    },
    {
      icon: <Truck className="h-5 w-5" />,
      title: "Standard Delivery",
      text: "Physical products reach your location within 7 business days from the date of order confirmation."
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Digital Fulfillment",
      text: "Digital products are delivered instantly to the email address provided at checkout."
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Timelines",
      text: "We strive to deliver your product as quickly as possible, maintaining high efficiency standards."
    },
    {
      icon: <AlertCircle className="h-5 w-5" />,
      title: "Variability",
      text: "Timelines may vary based on location, public holidays, or unforeseen delays beyond our control."
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-heading font-black italic tracking-tighter">
          Shopping <span className="text-primary italic">& Delivery</span>
        </h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
          Policy Overview
        </p>
      </div>

      <div className="space-y-6">
        <p className="text-muted-foreground leading-relaxed">
          At Turtle Labs, we prioritize swift fulfillment and secure delivery for both physical and digital assets. 
          Our logistics framework is optimized for minimal latency.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((item, i) => (
            <div key={i} className="glass-card p-6 bg-white/[0.02] border-white/5 hover:border-primary/20 transition-all group">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">{item.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-10 flex border-t border-white/5">
        <Link 
          href="/" 
          className="text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-2"
        >
          <span>←</span> Back to Neural Base
        </Link>
      </div>
    </div>
  );
}
