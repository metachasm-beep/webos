"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Search, 
  Settings, 
  ShieldCheck, 
  Smartphone, 
  Zap,
  ArrowRight,
  ChevronRight,
  Globe
} from "lucide-react";

function AuditContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "your-website.com";
  
  const [stage, setStage] = useState<"loading" | "report">("loading");
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("Initializing scan...");

  const tasks = [
    "Analyzing SEO metadata...",
    "Checking page load performance...",
    "Verifying mobile responsiveness...",
    "Security headers audit...",
    "Accessibility compliance check...",
    "User experience heuristics analysis...",
    "Finalizing growth report..."
  ];

  useEffect(() => {
    if (stage === "loading") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage("report"), 500);
            return 100;
          }
          const next = prev + Math.random() * 15;
          const taskIndex = Math.floor((next / 100) * tasks.length);
          setCurrentTask(tasks[Math.min(taskIndex, tasks.length - 1)]);
          return next;
        });
      }, 600);
      return () => clearInterval(interval);
    }
  }, [stage]);

  if (stage === "loading") {
    return (
      <main className="flex-1 flex items-center justify-center p-6 bg-muted/30">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative h-24 w-24 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center mx-auto">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">Analyzing {url}</h2>
            <p className="text-muted-foreground animate-pulse">{currentTask}</p>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{Math.round(progress)}% Complete</p>
          </div>

          <Card className="border-none shadow-sm text-left">
            <CardContent className="p-4 space-y-3">
              {tasks.map((task, i) => {
                const isActive = tasks.indexOf(currentTask) === i;
                const isDone = tasks.indexOf(currentTask) > i;
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                    )}
                    <span className={isDone ? "text-foreground" : isActive ? "text-primary font-medium" : "text-muted-foreground opacity-50"}>
                      {task}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-muted/30 pb-20">
      <div className="bg-background border-b py-8 mb-8">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>Audit Report for {url}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold">Overall Performance: <span className="text-primary">84/100</span></h1>
              <p className="text-muted-foreground max-w-xl">Great foundation, but there are critical opportunities to improve your conversion rate and SEO performance.</p>
            </div>
            <Button size="lg" className="shadow-lg shadow-primary/20">
              Unlock Full Report
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container space-y-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "SEO Score", score: "92", status: "excellent", icon: Search },
            { label: "Performance", score: "68", status: "needs-work", icon: Zap },
            { label: "Security", score: "100", status: "perfect", icon: ShieldCheck },
            { label: "UX/Mobile", score: "85", status: "good", icon: Smartphone }
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                  <span className={`text-sm font-bold uppercase tracking-tighter ${
                    stat.status === 'perfect' ? 'text-green-600' : 
                    stat.status === 'excellent' ? 'text-primary' : 
                    stat.status === 'good' ? 'text-blue-500' : 'text-orange-500'
                  }`}>
                    {stat.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-heading font-bold">{stat.score}</div>
                <p className="text-xs text-muted-foreground font-medium uppercase mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Top Critical Recommendations</CardTitle>
              <CardDescription>Actions with the highest impact on your business growth.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Improve First Contentful Paint",
                  desc: "Your site takes 2.8s to show content. Reducing this to <1.5s could improve conversions by 12%.",
                  impact: "High"
                },
                {
                  title: "Missing Meta Descriptions",
                  desc: "3 pages are missing meta descriptions, which reduces your click-through rate from Google.",
                  impact: "Medium"
                },
                {
                  title: "Optimize Call-to-Actions",
                  desc: "Your primary buttons have low contrast. Improving visibility could increase lead generation.",
                  impact: "High"
                }
              ].map((rec, i) => (
                <div key={i} className="group p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors flex items-start justify-between gap-4 cursor-pointer">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`h-4 w-4 ${rec.impact === 'High' ? 'text-orange-500' : 'text-blue-500'}`} />
                      <h4 className="font-bold text-sm uppercase tracking-tight">{rec.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="bg-primary text-primary-foreground border-none shadow-xl">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-heading font-bold">WebOS Pro</h3>
                  <p className="text-primary-foreground/80">Get the full AI-powered optimization toolkit.</p>
                </div>
                <ul className="space-y-3 text-sm">
                  {[
                    "Unlimited Deep Audits",
                    "AI Landing Page Builder",
                    "Custom Domain Hosting",
                    "Priority Growth Support"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="w-full font-bold h-12">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center p-8 text-center">
                 <div className="space-y-2">
                    <Settings className="h-8 w-8 text-muted-foreground mx-auto animate-spin-slow" />
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Builder Preview</p>
                 </div>
              </div>
              <CardContent className="p-6">
                <h4 className="font-heading font-bold mb-2">Ready to fix these issues?</h4>
                <p className="text-sm text-muted-foreground mb-4">WebOS can automatically generate a high-performance landing page optimized for your business.</p>
                <Button variant="outline" className="w-full">
                  Open AI Builder
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AuditPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
        <AuditContent />
      </Suspense>
    </div>
  );
}
