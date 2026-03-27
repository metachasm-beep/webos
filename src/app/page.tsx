"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BarChart3, Globe, Zap, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      router.push(`/audit?url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-background">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-muted/50 text-primary animate-in fade-in slide-in-from-bottom-3 duration-500">
                <Zap className="h-4 w-4 mr-2" />
                <span>Next-Gen Business Growth Engine</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight text-foreground leading-[1.1]">
                Replace your Marketing <span className="text-primary">Agency</span> with AI.
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Analyze your performance, build high-converting landing pages, and scale your SME with the power of WebOS.
              </p>

              <Card className="max-w-2xl mx-auto border-2 shadow-xl animate-in zoom-in-95 duration-700">
                <CardContent className="p-2">
                  <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Enter your website URL (e.g., example.com)" 
                        className="pl-10 h-12 border-none focus-visible:ring-0 text-base"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" size="lg" className="h-12 px-8 font-semibold">
                      Run Free Audit
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>SEO Analysis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Conversion Audit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>AI Copy Generation</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-secondary/20 blur-[120px]" />
          </div>
        </section>

        {/* Features Preview */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-heading font-bold">Everything you need to scale</h2>
              <p className="text-muted-foreground">WebOS combines powerful analytics with intuitive building tools to turn your website into a growth engine.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Smart Audits",
                  description: "Get deep insights into your website's performance, SEO, and conversion bottlenecks.",
                  icon: BarChart3
                },
                {
                  title: "AI Builder",
                  description: "Create stunning landing pages in minutes with our AI-powered drag-and-drop editor.",
                  icon: Zap
                },
                {
                  title: "Global Reach",
                  description: "Deploy your business anywhere with integrated hosting and domain management.",
                  icon: Globe
                }
              ].map((feature, i) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8 space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} WebOS by Antigravity. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
