import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Space_Grotesk, Outfit, Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading-classic",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-body-classic",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading-modern",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-body-modern",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-heading-elegant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-body-elegant",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "WebOS AI | Audit. Build. Dominate.",
  description: "WebOS AI is the ultimate business growth engine. Audit your website, build high-performance sections, and dominate your niche with AI.",
  metadataBase: new URL("https://webos-beta.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "WebOS AI | Audit. Build. Dominate.",
    description: "The ultimate business growth engine for modern enterprises.",
    url: "https://webos-beta.vercel.app",
    siteName: "WebOS AI",
    images: [
      {
        url: "/assets/branding/logo_full.png",
        width: 1200,
        height: 630,
        alt: "WebOS AI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WebOS AI | Audit. Build. Dominate.",
    description: "Transform your website into a growth machine with AI-powered audits and modular synthesis.",
    images: ["/assets/branding/logo_full.png"],
    creator: "@turtlelabsindia",
  },
  icons: {
    icon: [
      { url: "/assets/branding/icon.png" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: "/assets/branding/icon.png",
  },
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {gaId && <link rel="preconnect" href="https://www.googletagmanager.com" />}
      </head>
      <body className={`${cormorant.variable} ${montserrat.variable} ${spaceGrotesk.variable} ${outfit.variable} ${playfair.variable} ${lato.variable} antialiased`}>
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
