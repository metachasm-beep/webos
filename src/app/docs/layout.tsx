import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NeuralBackground } from "@/components/NeuralBackground";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <Navbar />
      <NeuralBackground />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
