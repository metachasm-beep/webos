import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WebOS | High-Performance Business Matrix",
  description: "Enterprise-grade neural optimization for global digital operations.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
};

import { AuthProvider } from "@/components/AuthProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { TooltipProvider } from "@/components/ui/tooltip";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className="dark">
      <body className={`${cormorant.variable} ${montserrat.variable} antialiased`}>
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        <AuthProvider>
          <TooltipProvider>
            <SmoothScroll>
              {children}
            </SmoothScroll>
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
