/**
 * Geekflare API Client
 * Integration for infrastructure security, performance, and DNS telemetry.
 * https://api.geekflare.com
 */

const GEEKFLARE_API_KEY = process.env.GEEKFLARE_API_KEY;

export interface GeekflareResult {
  performance?: any;
  tls?: any;
  dns?: any;
  security?: any;
}

export async function fetchGeekflareMetrics(url: string): Promise<GeekflareResult | null> {
  if (!GEEKFLARE_API_KEY) return null;
  const hostname = new URL(url).hostname;
  
  try {
    // 1. TLS/SSL Scan
    const tlsResp = await fetch("https://api.geekflare.com/v1/tls-scan", {
      method: "POST",
      headers: { "x-api-key": GEEKFLARE_API_KEY as string, "Content-Type": "application/json" },
      body: JSON.stringify({ url: hostname })
    });
    const tls = await tlsResp.json();

    // 2. DNS Lookup
    const dnsResp = await fetch("https://api.geekflare.com/v1/dns-lookup", {
      method: "POST",
      headers: { "x-api-key": GEEKFLARE_API_KEY as string, "Content-Type": "application/json" },
      body: JSON.stringify({ url: hostname })
    });
    const dns = await dnsResp.json();
    
    // 3. Performance (Simplified Load Time)
    const perfResp = await fetch("https://api.geekflare.com/v1/load-time", {
      method: "POST",
      headers: { "x-api-key": GEEKFLARE_API_KEY as string, "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const performance = await perfResp.json();

    return {
      tls: tls.data || tls,
      dns: dns.data || dns,
      performance: performance.data || performance,
      security: {
        score: tls.data?.score || 0,
        status: tls.data?.status || (tls.Status === "SUCCESS" ? "Clear" : "Offline")
      }
    };

  } catch (error) {
    console.error("[geekflare-client] Error:", error);
    return null;
  }
}

/**
 * Web Scraping API
 * Uses rotating proxies and browser rendering to bypass bot-detection.
 */
export async function fetchWebScraping(url: string): Promise<string | null> {
  if (!GEEKFLARE_API_KEY) return null;

  try {
    const response = await fetch("https://api.geekflare.com/v1/webscraping", {
      method: "POST",
      headers: { 
        "x-api-key": GEEKFLARE_API_KEY as string, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        url,
        renderJS: true, // Crucial for React/Angular/Vercel sites
        blockAds: true
      })
    });

    if (!response.ok) {
      console.warn(`[geekflare-scraping] HTTP Error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    // Geekflare Web Scraping returns { data: { html: "..." }, ... }
    return data?.data?.html || data?.html || null;

  } catch (error) {
    console.error("[geekflare-scraping] Fetch failed:", error);
    return null;
  }
}
