/**
 * Mozilla HTTP Observatory API Client
 * Integration for security header audits (CSP, HSTS, XFO) and cookie security.
 * https://observatory.mozilla.org/
 */

const OBSERVATORY_API = "https://observatory-api.mdn.mozilla.net/api/v2";

export interface ObservatoryResult {
  grade: string;
  score: number;
  tests_passed: number;
  tests_failed: number;
  scan_id: number;
  details: any;
}

export async function fetchObservatoryMetrics(url: string): Promise<ObservatoryResult | null> {
  const hostname = new URL(url).hostname;
  
  try {
    // 1. Kick off a scan
    const scanResp = await fetch(`${OBSERVATORY_API}/scan?host=${hostname}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    
    if (!scanResp.ok) {
      console.error("[observatory-client] Scan trigger failed:", scanResp.status);
      return null;
    }

    let scan = await scanResp.json();
    let attempts = 0;
    
    // 2. Poll for results (max 10s wait for a fast audit)
    while ((scan.state === "STARTING" || scan.state === "PENDING" || scan.state === "RUNNING") && attempts < 5) {
      await new Promise(r => setTimeout(r, 2000));
      const pollResp = await fetch(`${OBSERVATORY_API}/scan?host=${hostname}`);
      if (pollResp.ok) scan = await pollResp.json();
      attempts++;
    }

    if (scan.state !== "FINISHED") {
      console.warn("[observatory-client] Scan timed out or failed. Returning partial results.");
    }

    return {
      grade: scan.grade || "N/A",
      score: scan.score || 0,
      tests_passed: scan.tests_passed || 0,
      tests_failed: scan.tests_failed || 0,
      scan_id: scan.scan_id || 0,
      details: scan.tests || {} // Contains specific failure points
    };

  } catch (error) {
    console.error("[observatory-client] Error:", error);
    return null;
  }
}
