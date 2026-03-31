/**
 * DebugBear API Client
 * Integration for high-fidelity performance monitoring and Core Web Vitals.
 * https://www.debugbear.com/docs/api
 */

const DEBUGBEAR_API_KEY = process.env.DEBUGBEAR_API_KEY || "lHNwhuHNDtJRFvqZrsQPBxLcB";

export interface DebugBearResult {
  performance: number;
  vitals: {
    lcp: string;
    fid: string;
    cls: string;
    inp: string;
    ttfb: string;
  };
  metrics: {
    speedIndex: string;
    totalBlockingTime: string;
    firstContentfulPaint: string;
  };
  waterfallUrl: string;
  testId: string;
}

export async function fetchDebugBearMetrics(url: string): Promise<DebugBearResult | null> {
  try {
    const response = await fetch("https://www.debugbear.com/api/v1/page-test", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEBUGBEAR_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url, wait: true }) // Synchronous wait for result
    });

    if (!response.ok) {
      console.error("[debugbear-client] Error status:", response.status);
      return null;
    }

    const data = await response.json();
    
    // The data structure can vary depending on the exact test results
    const result = data.result || data;

    return {
      performance: Math.round(result.performanceScore * 100),
      vitals: {
        lcp: result.vitals?.lcp || "N/A",
        fid: result.vitals?.fid || "N/A",
        cls: result.vitals?.cls || "N/A",
        inp: result.vitals?.inp || "N/A",
        ttfb: result.vitals?.ttfb || "N/A"
      },
      metrics: {
        speedIndex: result.metrics?.speedIndex || "N/A",
        totalBlockingTime: result.metrics?.totalBlockingTime || "N/A",
        firstContentfulPaint: result.metrics?.firstContentfulPaint || "N/A"
      },
      waterfallUrl: result.waterfallUrl || "",
      testId: result.testId || ""
    };

  } catch (error) {
    console.error("[debugbear-client] Error:", error);
    return null;
  }
}
