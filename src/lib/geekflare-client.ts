/**
 * Geekflare API Client
 * Integration for infrastructure security, performance, and DNS telemetry.
 * https://api.geekflare.com
 */

const GEEKFLARE_API_KEY = process.env.GEEKFLARE_API_KEY || "y10MkLTwhdiVObpbwMhVLY8sNal2PKLe";

export interface GeekflareResult {
  performance?: any;
  tls?: any;
  dns?: any;
  security?: any;
}

export async function fetchGeekflareMetrics(url: string): Promise<GeekflareResult | null> {
  const hostname = new URL(url).hostname;
  
  try {
    // 1. TLS/SSL Scan
    const tlsResp = await fetch("https://api.geekflare.com/v1/tls-scan", {
      method: "POST",
      headers: { "x-api-key": GEEKFLARE_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ url: hostname })
    });
    const tls = await tlsResp.json();

    // 2. DNS Lookup
    const dnsResp = await fetch("https://api.geekflare.com/v1/dns-lookup", {
      method: "POST",
      headers: { "x-api-key": GEEKFLARE_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ url: hostname })
    });
    const dns = await dnsResp.json();
    
    // 3. Performance (Simplified Load Time)
    const perfResp = await fetch("https://api.geekflare.com/v1/load-time", {
      method: "POST",
      headers: { "x-api-key": GEEKFLARE_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const performance = await perfResp.json();

    return {
      tls: tls.data || tls,
      dns: dns.data || dns,
      performance: performance.data || performance,
      security: {
        score: (tls.data?.score || 80),
        status: tls.data?.status || "Provisioned"
      }
    };

  } catch (error) {
    console.error("[geekflare-client] Error:", error);
    return null;
  }
}
