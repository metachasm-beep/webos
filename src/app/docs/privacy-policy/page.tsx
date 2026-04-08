import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-heading font-black italic tracking-tighter">
          Privacy <span className="text-primary italic">Policy</span>
        </h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
          Last Updated: April 2026
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Thank you for choosing to be a part of our community at Turtle Labs (“Company”, “We”, “Us”, or “Our”). 
          We are committed to protecting your personal information and your right to privacy. If you have any 
          questions or concerns about our policy, or our practices with regards to your personal information, 
          please contact us at <a href="mailto:info@turtlelabs.co.in" className="text-primary hover:underline">info@turtlelabs.co.in</a>
        </p>

        <p>
          When you visit our website <a href="https://www.turtlelabs.co.in" target="_blank" className="text-primary hover:underline">www.turtlelabs.co.in</a> (“Site”) 
          and use our services, you trust us with your personal information. We take your privacy very seriously. 
          In this privacy notice, we describe our privacy policy. We seek to explain to you in the clearest way 
          possible what information we collect, how we use it and what rights you have in relation to that. 
          We hope you take some time to read through it carefully, as it is important. If there are any terms 
          in this privacy policy that you do not agree with, kindly feel free to discontinue the use of our 
          site and our services.
        </p>

        <p>
          This privacy policy applies to all information collected through our website or mobile application, 
          and/or any related services, sales, marketing or events (we refer to them collectively in this 
          privacy policy as the “Site“).
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider border-l-2 border-primary pl-4">1. WHAT INFORMATION DO WE COLLECT?</h2>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white/80 italic">Personal information that you disclose to us</h3>
            <p>
              <strong>In Short:</strong> We collect personal information that you provide to us such as name, 
              address, contact information, password & security data, payment information, and social media login data.
            </p>
            <p>
              We collect personal information that you voluntarily provide to us when registering with Turtle Labs, 
              expressing an interest in obtaining information about us or our products and services, 
              when participating in activities on the Site or otherwise contacting us.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider border-l-2 border-primary pl-4">2. HOW DO WE USE YOUR INFORMATION?</h2>
          <p>
            <strong>In Short:</strong> We process your information for purposes based on legitimate business 
            interests, the fulfillment of our contract with you, compliance with our legal obligations, 
            and/or your consent.
          </p>
          <p>
            We use the information we collect or receive to facilitate account creation, send marketing 
            communications, fulfill and manage orders, and protect our site from fraud.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider border-l-2 border-primary pl-4">3. WILL YOUR INFORMATION BE SHARED WITH ANYONE?</h2>
          <p>
            <strong>In Short:</strong> We only share information with your consent, to comply with laws, 
            to protect your rights, or to fulfill business obligations.
          </p>
          <p>
            We share and disclose your information for compliance with laws, vital interests, 
            or with vendors, consultants and other third-party service providers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider border-l-2 border-primary pl-4">4. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
          <p>
            We will only keep your personal information for as long as it is necessary for the purposes set 
            out in this privacy policy, unless a longer retention period is required or permitted by law. 
            No purpose in this policy will require us keeping your personal information for longer than 
            90 days past the termination of your account.
          </p>
        </section>

        <section className="space-y-4 pt-8 border-t border-white/5">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider border-l-2 border-primary pl-4">Contact Us</h2>
          <p>
            If you have questions or comments about this policy, email us at 
            <a href="mailto:info@turtlelabs.co.in" className="text-primary hover:underline ml-1">info@turtlelabs.co.in</a> or by post to:
          </p>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 font-mono text-sm leading-relaxed">
            Turtle Labs<br />
            #3, L2, Maxx Pride<br />
            Manish Nagar, Nagpur 441108<br />
            India<br />
            +91 74005 31107
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
