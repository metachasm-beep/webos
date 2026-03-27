import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Layout } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout className="h-6 w-6 text-primary" />
          <span className="text-xl font-heading font-bold tracking-tight">WebOS</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="#features" className="transition-colors hover:text-primary">Features</Link>
          <Link href="#audit" className="transition-colors hover:text-primary">Audit Tool</Link>
          <Link href="#pricing" className="transition-colors hover:text-primary">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">Login</Button>
          <Button size="sm">Get Started</Button>
        </div>
      </div>
    </header>
  );
}
