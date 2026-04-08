import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-heading font-black italic tracking-tighter">
          Refund <span className="text-primary italic">Policy</span>
        </h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
          Effective: April 2026
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <p>
          At Turtle Labs, we aim to ensure complete transparency in our billing and refund processes. 
          Please read our refund policy carefully.
        </p>

        <section className="space-y-6">
          <div className="grid gap-4">
            {[
              "Once your refund request is verified, we will credit the refund to your original payment method within 6–7 business days.",
              "Refund processing may vary slightly depending on your bank or payment provider.",
              "All refunds will be confirmed via email once processed."
            ].map((text, i) => (
              <div key={i} className="flex gap-4 items-start bg-white/5 p-6 rounded-2xl border border-white/10 group hover:border-primary/30 transition-all">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 mt-1">
                  0{i + 1}
                </div>
                <p className="text-white/80 font-medium leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold text-primary uppercase tracking-widest">Questions about Refunds?</h3>
          <p className="text-sm">
            If you have any questions regarding your refund or need to initiate a request, please 
            contact our support team at <a href="mailto:info@turtlelabs.co.in" className="text-white hover:underline font-bold">info@turtlelabs.co.in</a>.
          </p>
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
