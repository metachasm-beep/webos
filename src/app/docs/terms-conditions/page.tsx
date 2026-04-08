import Link from "next/link";

export default function TermsConditionsPage() {
  const sections = [
    {
      title: "1. Use of the Website",
      content: [
        "You must be at least 18 years of age to access and use this Website, or use it under the supervision of a parent or legal guardian.",
        "You agree to use the Website only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit the use of the Website by any third party.",
        "Unauthorized use of this Website may result in a claim for damages and/or constitute a criminal offense."
      ]
    },
    {
      title: "2. Intellectual Property Rights",
      content: [
        "All content on the Website, including but not limited to text, graphics, logos, images, audio, video, design elements, and software, is the property of Turtle Labs or its licensors.",
        "You may not copy, reproduce, modify, distribute, display, transmit, or otherwise use any content from the Website without prior written permission from Turtle Labs."
      ]
    },
    {
      title: "3. Services",
      content: [
        "Turtle Labs provides branding, advertising, digital marketing, website design, and related creative services.",
        "Service details, deliverables, and timelines will be confirmed in writing (via proposals, quotations, or contracts).",
        "We reserve the right to refuse service to any individual or entity at our sole discretion."
      ]
    },
    {
      title: "4. Payments",
      content: [
        "Payments must be made in accordance with the terms stated in the project proposal, quotation, or invoice.",
        "Late payments may result in penalties, interest charges, and/or suspension of services.",
        "For digital products or downloadable resources, all sales are final unless expressly stated otherwise."
      ]
    },
    {
      title: "5. Shipping and Delivery",
      content: [
        "For physical items (if applicable), delivery timelines will be provided at the time of purchase.",
        "For digital products, delivery will be made electronically to the email address or account details provided at checkout."
      ]
    },
    {
      title: "6. Limitation of Liability",
      content: [
        "Turtle Labs shall not be liable for any indirect, incidental, special, or consequential damages arising out of or related to your use of our Website, products, or services.",
        "We do not warrant that the Website will always be error-free, virus-free, or uninterrupted."
      ]
    },
    {
      title: "10. Governing Law",
      content: [
        "These Terms shall be governed by and construed in accordance with the laws of India.",
        "Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Nagpur, Maharashtra."
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-heading font-black italic tracking-tighter">
          Terms <span className="text-primary italic">& Conditions</span>
        </h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
          Effective Date: 1st September 2025
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-10 text-muted-foreground leading-relaxed">
        <p className="text-lg text-white/70 italic font-medium">
          Welcome to www.turtlelabs.co.in (“Website”), operated by Turtle Labs (“Company,” “we,” “our,” or “us”). 
          By accessing or using our Website, products, or services, you agree to be bound by these Terms and Conditions.
        </p>

        {sections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider bg-white/5 py-3 px-6 rounded-xl border-l-4 border-primary">
              {section.title}
            </h2>
            <ul className="space-y-3 pl-2">
              {section.content.map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-primary mt-1.5 shrink-0 select-none">◆</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="space-y-4 pt-8 border-t border-white/5">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider border-l-2 border-primary pl-4">Contact Information</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 font-mono text-sm leading-relaxed space-y-2">
            <p className="font-bold text-primary">Turtle Labs</p>
            <p>Website: <a href="https://www.turtlelabs.co.in" className="hover:text-primary transition-colors">www.turtlelabs.co.in</a></p>
            <p>Email: <a href="mailto:adityabisen@ymail.com" className="hover:text-primary transition-colors">adityabisen@ymail.com</a></p>
            <p>Phone: +91 74005 31107</p>
          </div>
        </section>
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
