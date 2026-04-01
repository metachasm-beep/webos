import { CohereClient } from "cohere-ai";
import * as cheerio from "cheerio";
import readability from "text-readability";
import { fetchPa11yMetrics } from "./pa11y-client";
import { fetchDebugBearMetrics } from "./debugbear-client";
import { fetchGeekflareMetrics, fetchWebScraping } from "./geekflare-client";
import { fetchObservatoryMetrics } from "./observatory-client";
import { runApifyActor, waitForApifyRun, getApifyDataset } from "./apify-client";


const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

const MOCK_DATA = {
  lighthouseResult: {
    categories: {
      performance:    { score: 0.84 },
      seo:            { score: 0.92 },
      accessibility:  { score: 0.95 },
      "best-practices":{ score: 0.87 },
    },
    audits: {
      "largest-contentful-paint":   { displayValue: "2.4 s" },
      "max-potential-fid":          { displayValue: "118 ms" },
      "cumulative-layout-shift":    { displayValue: "0.08" },
    },
  },
};

export async function fetchPageSpeedData(url: string): Promise<any> {
  const apiKey = process.env.PAGESPEED_API_KEY;

  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  if (!apiKey) {
    throw new Error("PAGESPEED_API_KEY is missing. Please add it to your environment variables.");
  }

  const endpoint =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
    `?url=${encodeURIComponent(normalizedUrl)}` +
    `&key=${apiKey}` +
    `&category=accessibility&category=best-practices&category=performance&category=seo` +
    `&strategy=mobile`;

  const RETRYABLE = new Set([429, 500, 502, 503, 504]);
  const MAX_RETRIES = 2; // Keep total runtime well under function timeout
  const FETCH_TIMEOUT_MS = 8000; // 8s hard timeout per attempt
  const RETRY_DELAYS = [1000, 2000]; // 1s then 2s — fast, safe

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        signal: controller.signal,
        next: { revalidate: 0 }
      });
      clearTimeout(timer);

      if (response.ok) {
        return await response.json();
      }

      // Read body for error detail
      const body = await response.text().catch(() => "");
      let errMsg = response.statusText || String(response.status);
      try {
        const parsed = JSON.parse(body);
        if (parsed.error?.message) errMsg = parsed.error.message;
      } catch (_) {}

      // Transient infra error — retry if we have attempts left
      if (RETRYABLE.has(response.status) && attempt < MAX_RETRIES) {
        console.warn(`[audit-engine] PageSpeed ${response.status} on attempt ${attempt}. Retrying in ${RETRY_DELAYS[attempt - 1]}ms...`);
        await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt - 1]));
        continue;
      }

      // Unreachable site (Google-specific)
      if (response.status === 500 && errMsg.includes("Unable to process")) {
        throw new Error("The site is unreachable by Google. Ensure the URL is public.");
      }

      // All retries exhausted for a transient error — return degraded
      if (RETRYABLE.has(response.status)) {
        console.warn(`[audit-engine] PageSpeed ${response.status} persisted. Using estimated baseline.`);
        return {
          ...MOCK_DATA,
          _degraded: true,
          _degradedReason: `Google PageSpeed API is temporarily down (${response.status}). Scores below are estimated baselines.`
        };
      }

      throw new Error(`PageSpeed API Error (${response.status}): ${errMsg}`);

    } catch (error: any) {
      clearTimeout(timer);

      const isAbort = error.name === "AbortError";
      const isOurThrow = error.message?.includes("unreachable") || error.message?.includes("PageSpeed API Error (4");

      // Timeout or network error with retries remaining
      if ((isAbort || !isOurThrow) && attempt < MAX_RETRIES) {
        const label = isAbort ? "Timeout" : "Network error";
        console.warn(`[audit-engine] ${label} on attempt ${attempt}. Retrying in ${RETRY_DELAYS[attempt - 1]}ms...`);
        await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt - 1]));
        continue;
      }

      // Re-throw real errors (bad API key, unreachable site, 4xx)
      if (isOurThrow) throw error;

      // Transient failure after all retries — degrade gracefully
      console.error(`[audit-engine] PageSpeed permanently unreachable:`, error.message);
      return {
        ...MOCK_DATA,
        _degraded: true,
        _degradedReason: `Google PageSpeed API is temporarily unavailable. Scores are estimated baselines. ${isAbort ? "(Request timed out)" : ""}`
      };
    }
  }

  return {
    ...MOCK_DATA,
    _degraded: true,
    _degradedReason: "Google PageSpeed API failed after all retries. Scores are estimated baselines."
  };
}

export async function fetchMultiEngineMetrics(url: string) {
  const [pa11y, debugbear, geekflare, observatory, apify] = await Promise.allSettled([
    fetchPa11yMetrics(url),
    fetchDebugBearMetrics(url),
    fetchGeekflareMetrics(url),
    fetchObservatoryMetrics(url),
    fetchApifyMetrics(url)
  ]);
  
  return { 
    pa11y:       pa11y.status === "fulfilled" ? pa11y.value : null, 
    debugbear:   debugbear.status === "fulfilled" ? debugbear.value : null, 
    geekflare:   geekflare.status === "fulfilled" ? geekflare.value : null, 
    observatory: observatory.status === "fulfilled" ? observatory.value : null,
    apify:       apify.status === "fulfilled" ? apify.value : null
  };
}

export async function fetchApifyMetrics(url: string) {
  if (!process.env.APIFY_API_KEY) return null;

  try {
    // Trigger the SEO Audit actor (Fast Audit - 3 pages)
    const run = await runApifyActor("apify/seo-audit-tool", {
      startUrls: [{ url }],
      maxPagesPerCrawl: 3,
      proxyConfiguration: { useApifyProxy: true }
    });

    if (!run) return null;

    // We wait up to 20 seconds for the deep crawl to finish
    // If it's slower, we return the run metadata so the UI can poll if needed
    const finished = await waitForApifyRun(run.id, 20000);
    
    if (finished) {
      const items = await getApifyDataset(run.defaultDatasetId);
      return { status: "SUCCEEDED", findings: items };
    }

    return { status: "PROCESSING", runId: run.id, datasetId: run.defaultDatasetId };
  } catch (error) {
    console.error("[Apify] Audit fetch error:", error);
    return null;
  }
}

export async function generateAuditSummary(url: string, metrics: any, growth?: any) {
  if (!process.env.COHERE_API_KEY) {
    return "AI summary is unavailable — add a COHERE_API_KEY to enable it.";
  }

  const perf = Math.round(metrics.lighthouseResult.categories.performance.score * 100);
  const seo  = Math.round(metrics.lighthouseResult.categories.seo.score * 100);
  const a11y = Math.round(metrics.lighthouseResult.categories.accessibility.score * 100);

  let growthContext = "";
  if (growth) {
    growthContext = `
    Business Growth Matrix:
    - Composite Growth Score: ${growth.score.total}/100 (${growth.score.status})
    - LTV:CAC Ratio: ${growth.metrics.ltv_cac}
    - Burn Multiple: ${growth.metrics.burn_multiple}
    - Runway: ${growth.metrics.runway} months
    `;
  }

  const prompt = `
    You are a high-level business growth consultant for WebOS AI. Write a clear, friendly 3-sentence executive summary
    for the following audit of ${url}. 
    
    Incorporate both the Technical Health and the Business Growth Matrix in your synthesis.
    Focus on the relationship between technical performance and business efficiency.
    
    Technical Scores (out of 100):
    - Performance: ${perf}
    - SEO: ${seo}
    - Accessibility: ${a11y}

    Advanced Local Telemetry:
    - Security Headers Score: ${metrics.security?.headers?.score || 'N/A'}/100
    - Content Readability: ${metrics.content?.readability?.score || 'N/A'} (Flesch Score), Grade ${metrics.content?.readability?.grade || 'N/A'}
    - Technology Detected: ${(metrics.tech || []).join(', ') || 'N/A'}

    ${growthContext}


    Keep it professional, direct, and avoid jargon or sci-fi metaphors.
  `;

  try {
    const response = await cohere.chat({
      model: "command-r7b-12-2024",
      message: prompt,
      maxTokens: 300,
      temperature: 0.4,
    });
    return response.text.trim();
  } catch (error: any) {
    console.error("Cohere Engine Error:", error);
    return `Summary generation failed: ${error?.message || "Unknown error"}. Check your Cohere API key permissions or model access.`;
  }
}

export async function createPdfReport(url: string, data: any) {
  const apiKey = process.env.API2PDF_API_KEY;
  if (!apiKey) return { status: "Error", message: "PDF generation requires API2PDF setup." };

  try {
    const metrics = data?.metrics || {};
    const summary = data?.summary || "No summary available.";

    const perf = Math.round(metrics?.performance ?? 0);
    const seo  = Math.round(metrics?.seo ?? 0);
    const a11y = Math.round(metrics?.accessibility ?? 0);
    const bp   = Math.round(metrics?.bestPractices ?? 0);
    const comp = Math.round(metrics?.composite?.total ?? metrics?.composite ?? 0);
    const growth = metrics?.growth || {};

    const lcp  = metrics?.lcp || data?.debugbear?.vitals?.lcp  || "N/A";
    const fid  = metrics?.fid || data?.debugbear?.vitals?.fid  || "N/A";
    const cls  = metrics?.cls || data?.debugbear?.vitals?.cls  || "N/A";
    const ttfb = metrics?.ttfb || data?.debugbear?.vitals?.ttfb || "N/A";

    const security = data?.security || {};
    const carbon   = data?.carbon   || null;
    const tech     = data?.tech     || [];
    const pa11y    = data?.pa11y    || {};
    const observatory = data?.observatory || {};
    const geekflare   = data?.geekflare   || {};
    const apify       = data?.apify       || null;
    const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const domain = url.replace(/https?:\/\//, "").split("/")[0];

    const sc  = (s: number) => s >= 90 ? "#16a34a" : s >= 70 ? "#d97706" : "#dc2626";
    const sbg = (s: number) => s >= 90 ? "#f0fdf4" : s >= 70 ? "#fffbeb" : "#fef2f2";
    const sbd = (s: number) => s >= 90 ? "#bbf7d0" : s >= 70 ? "#fde68a" : "#fecaca";
    const sl  = (s: number) => s >= 90 ? "Excellent" : s >= 70 ? "Good" : "Needs Work";

    const securityScore = data?.security?.headers?.score || data?.geekflare?.security?.score || 0;

    // SVG Radar Map Calculations (5 axes: Perf, SEO, A11y, BP, Security)
    const axes = [
      { name: "Perf", score: perf },
      { name: "SEO", score: seo },
      { name: "A11y", score: a11y },
      { name: "BP", score: bp },
      { name: "Security", score: securityScore }
    ];
    const center = 170;
    const radius = 100;
    const points = axes.map((a, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const r = (a.score / 100) * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(" ");

    const radarColor = sc(comp);
    const radarSvg = `
      <svg width="340" height="340" viewBox="0 0 340 340" style="display:block;margin:0 auto">
        <!-- Background Grid -->
        <circle cx="170" cy="170" r="${radius}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1.5" />
        <circle cx="170" cy="170" r="${radius*0.75}" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.75" />
        <circle cx="170" cy="170" r="${radius*0.5}" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.75" />
        <circle cx="170" cy="170" r="${radius*0.25}" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.75" />
        ${axes.map((a, i) => {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          const lx = center + (radius + 24) * Math.cos(angle);
          const ly = center + (radius + 24) * Math.sin(angle);
          const align = i === 0 ? "middle" : (i === 1 || i === 2 ? "start" : "end");
          return `
            <line x1="170" y1="170" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
            <text x="${lx}" y="${ly}" text-anchor="${align}" fill="rgba(255,255,255,0.4)" style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em">${a.name} · ${a.score}</text>
          `;
        }).join("")}
        <!-- Data Polygon -->
        <polygon points="${points}" fill="${radarColor}" fill-opacity="0.25" stroke="${radarColor}" stroke-width="3" />
        <!-- Center Growth Orb -->
        <circle cx="170" cy="170" r="28" fill="#0a0a0f" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <text x="170" y="175" text-anchor="middle" fill="#fff" style="font-size:24px;font-weight:900;letter-spacing:-1px">${comp}</text>
        <text x="170" y="185" text-anchor="middle" fill="rgba(255,255,255,0.3)" style="font-size:6px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Growth</text>
      </svg>
    `;

    // Executive insights
    const insights: string[] = [];
    if (seo >= 85 && a11y >= 85) insights.push("Strong foundation — SEO and accessibility scores are in the top tier, providing excellent organic reach.");
    else if (seo >= 70) insights.push("Solid SEO foundation — your site is discoverable, but content structure can be strengthened further.");
    else insights.push("SEO needs attention — search visibility is limited; addressing meta and content structure is priority.");
    if (perf < 60) insights.push(`Critical bottleneck — Performance at ${perf}/100 is severely impacting user experience and conversion rates.`);
    else if (perf < 80) insights.push(`Performance gap — Loading speed of ${perf}/100 is below the competitive benchmark and may be losing visitors.`);
    else insights.push("Performance is healthy — your site loads fast, providing a smooth first impression for visitors.");
    if (perf < 80) insights.push("High growth opportunity — Resolving performance issues could unlock significant improvements in engagement and revenue.");
    else insights.push("Optimization phase — Core metrics are solid; focus shifts to fine-tuning conversion flows and UX polish.");

    const levelColor = (l: string) => l === "Critical" || l === "High" ? "#dc2626" : l === "High Impact" || l === "Priority" ? "#d97706" : "#2563eb";
    const levelBg    = (l: string) => l === "Critical" || l === "High" ? "#fee2e2" : l === "High Impact" || l === "Priority" ? "#fef3c7" : "#dbeafe";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>WebOS AI Audit Report — ${domain}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { font-family: 'Inter', 'Helvetica Neue', sans-serif; color: #111827; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 13px; line-height: 1.6; }
    .page { width: 210mm; height: 297mm; position: relative; background: #fff; page-break-after: always; overflow: hidden; }
    .page:last-child { page-break-after: auto; }

    /* PAGE 1 — COVER */
    .cover { background: #0a0a0f; color: white; display: flex; flex-direction: column; height: 297mm; }
    .cover-hdr { padding: 44px 44px 0; display: flex; justify-content: space-between; align-items: center; }
    .cover-brand { font-size: 11px; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.4); }
    .cover-date  { font-size: 10px; color: rgba(255,255,255,0.25); letter-spacing: 0.15em; }
    .cover-hero  { flex: 1; display: flex; align-items: center; padding: 0 44px; gap: 40px; }
    .cover-left  { flex: 1; }
    .cover-right { flex-shrink: 0; }
    .cover-eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 24px; }
    .cover-t1 { font-size: 14px; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 8px; }
    .cover-t2 { font-size: 58px; font-weight: 900; letter-spacing: -2.5px; color: #fff; line-height: 0.95; margin-bottom: 12px; }
    .cover-sub { font-size: 16px; color: rgba(255,255,255,0.5); margin-bottom: 40px; line-height: 1.5; }
    .cover-meta { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 32px; display: grid; gap: 16px; }
    .meta-row { display: flex; gap: 12px; align-items: baseline; }
    .meta-row label { font-size: 10px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.25); width: 60px; flex-shrink: 0; }
    .meta-row span { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
    .score-dash { padding: 28px 44px; border-top: 1px solid rgba(255,255,255,0.06); }
    .score-dash-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 16px; }
    .score-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .sc-dark { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 22px 14px; text-align: center; }
    .sc-dark .num { font-size: 46px; font-weight: 900; letter-spacing: -2px; line-height: 1; }
    .sc-dark .lbl { font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-top: 8px; }
    .exec { padding: 32px 44px 56px; }
    .exec-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 18px; }
    .ins-item { display: flex; gap: 14px; margin-bottom: 12px; align-items: flex-start; }
    .ins-dot { width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; flex-shrink: 0; margin-top: 6px; }
    .ins-text { font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.7; }

    /* INNER PAGES */
    .inner { display: flex; flex-direction: column; min-height: 297mm; }
    .ph { padding: 28px 44px 24px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: flex-end; }
    .ph-brand { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #d1d5db; }
    .ph-num { font-size: 10px; color: #e5e7eb; }
    .pc { padding: 32px 44px; flex: 1; }
    .pg-title { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; }
    .pg-desc  { font-size: 12px; color: #6b7280; margin-bottom: 24px; }

    /* SCORE CARDS (light pages) */
    .sc4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .sc4-card { border-radius: 12px; padding: 16px 14px; text-align: center; border: 1px solid; }
    .sc4-num { font-size: 36px; font-weight: 900; letter-spacing: -1.5px; line-height: 1; }
    .sc4-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: #6b7280; margin-top: 5px; }
    .sc4-tag { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 5px; }

    /* GAUGE */
    .gauge-row { display: flex; align-items: center; gap: 20px; margin-bottom: 22px; }
    .gauge-circle { width: 90px; height: 90px; border-radius: 50%; border: 6px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
    .gauge-num { font-size: 28px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
    .gauge-s { font-size: 7px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 2px; }
    .bar-track { flex: 1; height: 5px; background: #f3f4f6; border-radius: 99px; overflow: hidden; }
    .bar-fill  { height: 100%; border-radius: 99px; }

    /* SECTION HEADER */
    .sh { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
    .sh-icon { font-size: 14px; }
    .sh-title { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: #374151; }
    .sh-line { flex: 1; height: 1px; background: #f3f4f6; }

    /* AI SUMMARY */
    .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6; border-radius: 0 10px 10px 0; padding: 16px 20px; margin-bottom: 20px; }
    .summary-text { font-size: 12px; color: #374151; line-height: 1.75; }

    /* IMPACT LIST */
    .imp-list { list-style: none; margin: 0 0 18px 0; padding: 0; }
    .imp-list li { display: flex; gap: 10px; padding: 7px 0; border-bottom: 1px solid #f9fafb; font-size: 12px; color: #374151; }
    .imp-list li::before { content: "—"; color: #dc2626; font-weight: 700; flex-shrink: 0; }

    /* ACTION CARDS */
    .action-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .ac { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
    .ac-title { font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    .ac-level { font-size: 8px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 2px 7px; border-radius: 20px; display: inline-block; margin-bottom: 10px; }
    .ac-items { list-style: none; padding: 0; margin: 0; }
    .ac-items li { font-size: 10px; color: #4b5563; padding: 3px 0 3px 12px; position: relative; line-height: 1.4; }
    .ac-items li::before { content: "·"; position: absolute; left: 3px; font-weight: 900; color: #9ca3af; }

    /* VITALS GRID */
    .vitals { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
    .vital-card { border-radius: 10px; padding: 12px 10px; text-align: center; }
    .vital-v { font-size: 18px; font-weight: 800; }
    .vital-k { font-size: 8px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; margin-top: 3px; }

    /* METRICS TABLE */
    .mt { width: 100%; border-collapse: collapse; }
    .mt td { padding: 9px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px; }
    .mt td:first-child { color: #6b7280; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; font-size: 9px; }
    .mt td:last-child { font-weight: 700; color: #111827; text-align: right; }

    /* COMPARISON TABLE */
    .cmp { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; margin-bottom: 18px; }
    .cmp-col { padding: 16px 18px; }
    .cmp-col:first-child { border-right: 1px solid #e5e7eb; background: #fef2f2; }
    .cmp-col:last-child  { background: #f0fdf4; }
    .cmp-hdr { font-size: 9px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
    .cmp-item { font-size: 11px; padding: 4px 0 4px 12px; position: relative; border-bottom: 1px solid rgba(0,0,0,0.04); line-height: 1.4; }
    .cmp-item::before { content: "›"; position: absolute; left: 2px; font-weight: 700; }

    /* TRUST */
    .trust3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .trust-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; text-align: center; }
    .trust-big { font-size: 34px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
    .trust-sub { font-size: 8px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280; margin-top: 5px; }
    .trust-lbl { font-size: 9px; font-weight: 700; margin-top: 3px; }
    .trust-alert { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #6366f1; border-radius: 0 10px 10px 0; padding: 12px 16px; margin-bottom: 18px; font-size: 11px; color: #374151; line-height: 1.65; }
    .trust-acs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .tac { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; }
    .tac-title { font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 5px; }
    .tac-level { font-size: 7px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 2px 7px; border-radius: 20px; display: inline-block; margin-bottom: 8px; }
    .tac-items { list-style: none; padding: 0; margin: 0; }
    .tac-items li { font-size: 10px; color: #4b5563; padding: 3px 0 3px 12px; position: relative; border-bottom: 1px solid #f9fafb; line-height: 1.4; }
    .tac-items li:last-child { border-bottom: none; }
    .tac-items li::before { content: "·"; position: absolute; left: 3px; color: #9ca3af; font-weight: 900; }

    /* TECH BADGES */
    .tech { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
    .tech span { background: #f3f4f6; border: 1px solid #e5e7eb; padding: 3px 10px; border-radius: 20px; font-size: 9px; font-weight: 700; color: #374151; }

    /* FOOTER */
    .pf { padding: 14px 44px 20px; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
    .pf-brand { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #d1d5db; }
    .pf-note  { font-size: 8px; color: #e5e7eb; text-transform: uppercase; letter-spacing: 0.1em; }

    /* GROWTH PAGE */
    .growth { background: #0a0a0f; color: white; display: flex; flex-direction: column; min-height: 297mm; }
    .g-hdr { padding: 32px 44px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: flex-end; }
    .g-brand { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.25); }
    .g-num   { font-size: 10px; color: rgba(255,255,255,0.15); }
    .g-body  { padding: 36px 44px; flex: 1; }
    .g-title { font-size: 26px; font-weight: 900; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }
    .g-desc  { font-size: 12px; color: rgba(255,255,255,0.35); margin-bottom: 32px; }
    .phase { display: flex; gap: 0; margin-bottom: 18px; }
    .ph-left { width: 150px; flex-shrink: 0; padding-right: 22px; border-right: 1px solid rgba(255,255,255,0.08); margin-right: 24px; padding-top: 2px; }
    .ph-marker { font-size: 8px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #3b82f6; margin-bottom: 4px; }
    .ph-days   { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
    .ph-name   { font-size: 18px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
    .ph-right  { flex: 1; padding-top: 4px; }
    .ph-items  { list-style: none; padding: 0; margin: 0; }
    .ph-items li { font-size: 12px; color: rgba(255,255,255,0.6); padding: 5px 0 5px 16px; position: relative; border-bottom: 1px solid rgba(255,255,255,0.04); line-height: 1.4; }
    .ph-items li:last-child { border-bottom: none; }
    .ph-items li::before { content: "→"; position: absolute; left: 0; color: #3b82f6; font-size: 10px; }
    .g-closing { margin-top: 36px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px; }
    .close-1 { font-size: 22px; font-weight: 300; color: rgba(255,255,255,0.4); font-style: italic; line-height: 1.3; margin-bottom: 4px; }
    .close-2 { font-size: 22px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
    .g-footer { padding: 18px 44px 28px; display: flex; justify-content: space-between; align-items: center; }
    .g-fb { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.2); }
    .g-fn { font-size: 8px; color: rgba(255,255,255,0.12); text-transform: uppercase; letter-spacing: 0.15em; }
  </style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page cover">
  <div class="cover-hdr">
    <div class="cover-brand">WebOS AI</div>
    <div class="cover-date">Generated ${date}</div>
  </div>
  <div class="cover-hero">
    <div class="cover-left">
      <div class="cover-eyebrow">AI Performance Intelligence</div>
      <div class="cover-t1">${domain}</div>
      <div class="cover-t2">Audit Report</div>
      <p class="cover-sub">Actionable business intelligence and technical performance telemetry.</p>
      
      <div class="cover-meta">
        <div class="meta-row"><label>URL</label><span>${url}</span></div>
        <div class="meta-row"><label>DATE</label><span>${date}</span></div>
        <div class="meta-row"><label>VERSION</label><span>Neural v1.2</span></div>
      </div>
    </div>
    <div class="cover-right">
      ${radarSvg}
    </div>
  </div>
  <div class="score-dash">
    <div class="score-dash-lbl">Score Dashboard</div>
    <div class="score-cards">
      ${[["Composite", comp, true], ["Performance", perf, false], ["SEO", seo, false], ["Accessibility", a11y, false]].map(([label, score, isComp]) =>
        `<div class="sc-dark">
          <div class="num" style="color:${isComp ? '#ffffff' : sc(score as number)}">${score}</div>
          <div class="lbl">${label}</div>
        </div>`).join("")}
    </div>
  </div>
  <div class="exec">
    <div class="exec-lbl">Executive Insight</div>
    ${insights.map((ins, i) =>
      `<div class="ins-item">
        <div class="ins-dot" style="background:${i === 1 && perf < 60 ? '#ef4444' : i === 2 ? '#22c55e' : '#3b82f6'}"></div>
        <div class="ins-text">${ins}</div>
      </div>`).join("")}
  </div>
</div>

<!-- PAGE 2: PERFORMANCE -->
<div class="page inner">
  <div class="ph"><div class="ph-brand">WebOS AI Audit Report</div><div class="ph-num">Page 02</div></div>
  <div class="pc">
    <div class="pg-title">Performance Analysis</div>
    <div class="pg-desc">Deep dive into load times, rendering, and user experience metrics</div>

    <div class="gauge-row">
      <div class="gauge-circle" style="border-color:${sc(perf)};background:${sbg(perf)}">
        <div class="gauge-num" style="color:${sc(perf)}">${perf}</div>
        <div class="gauge-s" style="color:${sc(perf)}">Score</div>
      </div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span style="font-size:9px;color:#9ca3af">0</span>
          <div class="bar-track"><div class="bar-fill" style="width:${perf}%;background:${sc(perf)}"></div></div>
          <span style="font-size:9px;color:#9ca3af">100</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:9px;color:#9ca3af;margin-bottom:6px">
          <span>0</span><span style="color:#d97706">Benchmark: 80</span><span>100</span>
        </div>
        <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${sc(perf)}">${sl(perf)}</div>
      </div>
    </div>

    <div class="vitals">
      ${[["LCP", lcp], ["FID / INP", fid], ["CLS", cls], ["TTFB", ttfb]].map(([k, v]) =>
        `<div class="vital-card" style="background:${sbg(70)};border:1px solid ${sbd(70)}">
          <div class="vital-v" style="color:${sc(70)}">${v}</div>
          <div class="vital-k">${k}</div>
        </div>`).join("")}
    </div>

    <div class="sh"><span class="sh-icon">💡</span><span class="sh-title">What's Happening</span><div class="sh-line"></div></div>
    <p class="summary-text" style="margin-bottom:18px">${perf < 60 ? `Current load time is elevated — over 2x the recommended 2.5-second threshold. Users may be abandoning the site before content renders.` : perf < 80 ? `Performance is below the competitive benchmark. Optimizing render-blocking resources will improve perceived load speed.` : `Performance is within acceptable range. Monitor for regressions during peak load periods.`}</p>

    ${perf < 80 ? `<div class="sh"><span class="sh-icon">📉</span><span class="sh-title">Business Impact</span><div class="sh-line"></div></div>
    <ul class="imp-list">
      <li>High bounce rate — 53% of visitors leave before interaction</li>
      <li>Reduced engagement — average session shortened significantly</li>
      <li>Lower conversion potential — every extra second costs revenue</li>
    </ul>` : ""}

    <div class="sh"><span class="sh-icon">🎯</span><span class="sh-title">Recommended Actions</span><div class="sh-line"></div></div>
    <div class="action-cards">
      ${[
        { title: "Reduce Load Time", level: "Critical", items: ["Lazy load images below the fold", "Defer non-critical JavaScript", "Remove unused CSS and JS code"] },
        { title: "Optimize Media", level: "High Impact", items: ["Convert images to WebP/AVIF formats", "Implement responsive image sizing", "Compress all media assets"] },
        { title: "Improve Server Response", level: "High Impact", items: ["Enable browser and server caching", "Deploy a global CDN", "Optimize backend response times"] }
      ].map(a => `<div class="ac">
        <div class="ac-title">${a.title}</div>
        <div class="ac-level" style="background:${levelBg(a.level)};color:${levelColor(a.level)}">${a.level}</div>
        <ul class="ac-items">${a.items.map(it => `<li>${it}</li>`).join("")}</ul>
      </div>`).join("")}
    </div>
  </div>
  <div class="pf"><div class="pf-brand">WebOS AI</div><div class="pf-note">Confidential · ${date}</div></div>
</div>

<!-- PAGE 3: SEO & CONTENT -->
<div class="page inner">
  <div class="ph"><div class="ph-brand">WebOS AI Audit Report</div><div class="ph-num">Page 03</div></div>
  <div class="pc">
    <div class="pg-title">SEO & Content Optimization</div>
    <div class="pg-desc">Search visibility, content quality, and conversion readiness</div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px">
      <div style="background:${sbg(seo)};border:1px solid ${sbd(seo)};border-radius:12px;padding:18px 20px">
        <div style="font-size:38px;font-weight:900;letter-spacing:-1px;color:${sc(seo)}">${seo}</div>
        <div style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${sc(seo)};margin-top:5px">SEO · ${sl(seo)} Search Presence</div>
        <div style="font-size:11px;color:#4b5563;margin-top:7px;">${seo >= 85 ? "Well-indexed with solid meta tags and structured data." : "Meta tags and structured data need review for better indexing."}</div>
      </div>
      <div style="background:${sbg(a11y)};border:1px solid ${sbd(a11y)};border-radius:12px;padding:18px 20px">
        <div style="font-size:38px;font-weight:900;letter-spacing:-1px;color:${sc(a11y)}">${a11y}</div>
        <div style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${sc(a11y)};margin-top:5px">Accessibility · ${sl(a11y)}</div>
        <div style="font-size:11px;color:#4b5563;margin-top:7px;">${(pa11y?.errors || 0) === 0 ? "No critical WCAG violations detected." : `${pa11y?.errors || 0} WCAG errors require attention.`}</div>
      </div>
    </div>

    <p style="font-size:12px;color:#374151;font-style:italic;margin-bottom:18px;padding:12px 16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;line-height:1.7">Your website ranks well but does not convert efficiently. Content optimization can dramatically improve engagement.</p>

    <div class="sh"><span class="sh-icon">⚡</span><span class="sh-title">Content Comparison</span><div class="sh-line"></div></div>
    <div class="cmp">
      <div class="cmp-col">
        <div class="cmp-hdr" style="color:#dc2626">Current</div>
        ${["Long, dense paragraphs with no visual breaks","High reading difficulty (Grade 14+)","Weak or missing CTA placement"].map(it =>`<div class="cmp-item" style="color:#7f1d1d">${it}</div>`).join("")}
      </div>
      <div class="cmp-col">
        <div class="cmp-hdr" style="color:#16a34a">Optimized</div>
        ${["Short, scannable content blocks","Clear headings with logical hierarchy","Strong CTA flow at every decision point"].map(it =>`<div class="cmp-item" style="color:#14532d">${it}</div>`).join("")}
      </div>
    </div>

    <div class="sh"><span class="sh-icon">🤖</span><span class="sh-title">AI Summary</span><div class="sh-line"></div></div>
    <div class="summary-box"><p class="summary-text">${summary}</p></div>

    <div class="sh"><span class="sh-icon">✅</span><span class="sh-title">Action Recommendations</span><div class="sh-line"></div></div>
    <ul class="imp-list">
      <li>Simplify language to Grade 8 reading level for wider accessibility</li>
      <li>Structure content as Problem → Solution → Proof → CTA</li>
      <li>Improve heading hierarchy with descriptive H2/H3 tags</li>
      <li>Add schema markup (FAQ, Organization) to boost rich snippets</li>
    </ul>

    ${apify?.findings?.length ? `
    <div class="sh" style="margin-top:20px"><span class="sh-icon">🔍</span><span class="sh-title">Deep Crawl Findings (Apify)</span><div class="sh-line"></div></div>
    <div style="background:#fefce8;border:1px solid #fef08a;border-radius:10px;padding:12px 16px;margin-top:10px">
      <div style="font-size:11px;font-weight:700;color:#854d0e;margin-bottom:8px">Multi-Page Technical SEO Issues:</div>
      <ul style="margin:0;padding-left:18px;font-size:11px;color:#713f12;line-height:1.6">
        ${apify.findings.slice(0, 4).map((f: any) => `<li>${f.message || f.description || "Issue detected in deep crawl"}</li>`).join("")}
      </ul>
    </div>
    ` : ""}
  </div>
  <div class="pf"><div class="pf-brand">WebOS AI</div><div class="pf-note">Confidential · ${date}</div></div>
</div>

<!-- PAGE 4: TRUST & INFRA -->
<div class="page inner">
  <div class="ph"><div class="ph-brand">WebOS AI Audit Report</div><div class="ph-num">Page 04</div></div>
  <div class="pc">
    <div class="pg-title">Accessibility, Trust & Infrastructure</div>
    <div class="pg-desc">Compliance, security posture, and technical trustworthiness</div>

    <div class="trust3">
      <div class="trust-card">
        <div class="trust-big" style="color:${sc(a11y)}">${a11y}</div>
        <div class="trust-sub">Accessibility Score</div>
        <div class="trust-lbl" style="color:${sc(a11y)}">${sl(a11y)}</div>
      </div>
      <div class="trust-card">
        <div class="trust-big" style="color:${security?.status === "Clear" ? "#16a34a" : "#dc2626"};font-size:16px;margin-top:8px">${security?.status === "Clear" ? "Verified" : "Risk"}</div>
        <div class="trust-sub">Safe Browsing Status</div>
        <div class="trust-lbl" style="color:${security?.status === "Clear" ? "#16a34a" : "#dc2626"}">${security?.status === "Clear" ? "No Threats" : "Risk Detected"}</div>
      </div>
      <div class="trust-card">
        <div class="trust-big" style="color:${sc(security?.headers?.score || 0)}">${security?.headers?.score || "N/A"}</div>
        <div class="trust-sub">Headers Score</div>
        <div class="trust-lbl" style="color:${sc(security?.headers?.score || 0)}">${sl(security?.headers?.score || 0)}</div>
      </div>
    </div>

    <div class="trust-alert">Compliance is ${a11y >= 90 ? "strong across the board" : "partially established"}, but optimization is ${a11y >= 95 ? "complete" : "incomplete"} — ${(pa11y?.errors || 0) > 0 ? `${pa11y.errors} WCAG errors and ` : ""}key headers and interaction patterns need attention.</div>

    <div class="sh"><span class="sh-icon">🔐</span><span class="sh-title">Trust Optimization</span><div class="sh-line"></div></div>
    <div class="trust-acs">
    ${tech && tech.length > 0 ? `
    <div class="sh" style="margin-top:14px"><span class="sh-icon">🛠</span><span class="sh-title">Technology Stack</span><div class="sh-line"></div></div>
    <div class="tech" style="margin-bottom:14px">${tech.slice(0,8).map((t: string) => `<span>${t}</span>`).join("")}</div>` : ""}

    <div class="sh" style="margin-top:8px"><span class="sh-icon">📊</span><span class="sh-title">Key Metrics</span><div class="sh-line"></div></div>
    <table class="mt" style="margin-bottom:20px">
      <tr><td>Observatory Grade</td><td style="font-size:16px;font-weight:900;color:${(observatory?.score||0)>70?'#22c55e':'#f97316'}">${observatory?.grade || "N/A"}</td></tr>
      <tr><td>TLS/SSL Score</td><td>${geekflare?.tls?.score || "Provisioned"}</td></tr>
      <tr><td>Accessibility Issues</td><td style="color:${(pa11y?.errors||0)>0?'#ef4444':'#22c55e'}">${pa11y?.errors||0} errors</td></tr>
    </table>

    <div class="sh"><span class="sh-icon">🚀</span><span class="sh-title">90-Day Growth Roadmap</span><div class="sh-line"></div></div>
    <div style="background:#0a0a0f;border-radius:14px;padding:22px;color:#fff">
      ${[
        { phase: "Quick Wins", days: "0-7 Days", items: ["Image compression & lazy loading", "Remove blocking JS scripts"] },
        { phase: "Foundation", days: "7-30 Days", items: ["CDN setup & global caching", "Content layout restructuring"] },
        { phase: "Scale", days: "30-90 Days", items: ["A/B UX Testing", "Scaling server infrastructure"] }
      ].map(ph => `<div style="display:flex;gap:20px;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:10px">
        <div style="width:100px;flex-shrink:0"><div style="font-size:7px;color:#3b82f6;text-transform:uppercase;font-weight:800">${ph.days}</div><div style="font-size:14px;font-weight:800">${ph.phase}</div></div>
        <ul style="flex:1;list-style:none;padding:0;margin:0;font-size:11px;color:rgba(255,255,255,0.6)">${ph.items.map(it => `<li>• ${it}</li>`).join("")}</ul>
      </div>`).join("")}
    </div>
  </div>
  <div class="pf"><div class="pf-brand">WebOS AI</div><div class="pf-note">Confidential · ${date}</div></div>
</div>

</body>
</html>`;

    const response = await fetch("https://v2.api2pdf.com/chrome/pdf/html", {
      method: "POST",
      headers: { "Authorization": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        html,
        inline: true,
        fileName: `WebOS_AI_Audit_${domain}.pdf`,
        options: { marginTop: "0mm", marginBottom: "0mm", marginLeft: "0mm", marginRight: "0mm", printBackground: true }
      }),
    });

    if (!response.ok) throw new Error(`PDF generation failed: ${response.status}`);
    const result = await response.json();
    return { status: "Provisioned", downloadUrl: result.FileUrl };
  } catch (error) {
    console.error("PDF engine error:", error);
    return { status: "Error", message: "PDF generation is offline. Your scores above are still accurate." };
  }
}






export async function fetchCarbonMetrics(url: string) {
  try {
    const response = await fetch(`https://api.websitecarbon.com/site?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(5000), // 5s timeout, don't block the whole audit if it fails
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("[audit-engine] Carbon fetch failed:", error);
    return null;
  }
}

export async function checkSafeBrowsing(url: string) {
  const apiKey = process.env.SAFE_BROWSING_API_KEY || process.env.PAGESPEED_API_KEY;
  if (!apiKey) return { status: "Unknown", message: "API key missing" };

  try {
    const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: { clientId: "webos-ai-growth-matrix", clientVersion: "1.0.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: normalizeUrl(url) }],
        },
      }),
    });

    if (!response.ok) return { status: "Unknown", message: `Error ${response.status}` };
    const data = await response.json();

    // If matches exist, it's unsafe. Otherwise it's empty/clear.
    if (data.matches && data.matches.length > 0) {
      return { status: "Unsafe", threats: data.matches.map((m: any) => m.threatType) };
    }
    return { status: "Clear" };
  } catch (error) {
    console.error("[audit-engine] Safe Browsing failed:", error);
    return { status: "Unknown", message: "Timeout" };
  }
}

function normalizeUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export async function runLocalAudit(url: string) {
  const normalized = normalizeUrl(url);
  try {
    const response = await fetch(normalized, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      next: { revalidate: 0 } 
    });
    
    if (!response.ok) throw new Error(`Could not fetch site: ${response.statusText}`);
    
    const html = await response.text();
    const headers = response.headers;

    const security = analyzeSecurityHeaders(headers);
    const content = analyzeHtmlContent(html);
    const tech = detectTechStack(html, headers);

    return {
      security,
      content,
      tech,
    };
  } catch (error: any) {
    console.warn(`[local-audit] Direct fetch failed for ${normalized}: ${error.message}. Attempting Geekflare Scraping fallback...`);
    
    try {
      const scrapedHtml = await fetchWebScraping(normalized);
      if (scrapedHtml) {
        // Since we don't have original HTTP headers from a scrape, we pass an empty Headers object
        // but the tech and content analysis will still work perfectly on the HTML.
        const mockHeaders = new Headers();
        const security = analyzeSecurityHeaders(mockHeaders);
        const content = analyzeHtmlContent(scrapedHtml);
        const tech = detectTechStack(scrapedHtml, mockHeaders);

        return {
          security,
          content,
          tech,
          _scraped: true
        };
      }
    } catch (scrapeError) {
      console.error("[local-audit] Scraping fallback also failed:", scrapeError);
    }

    console.error("[local-audit] All fetch methods failed.");
    return null;
  }
}

function analyzeSecurityHeaders(headers: Headers) {
  const check = (h: string) => headers.has(h.toLowerCase());
  const get = (h: string) => headers.get(h.toLowerCase()) || "";

  const results = {
    hsts: check("Strict-Transport-Security"),
    csp: check("Content-Security-Policy"),
    xfo: check("X-Frame-Options"),
    xss: check("X-XSS-Protection"),
    nosniff: check("X-Content-Type-Options"),
    referrer: check("Referrer-Policy"),
    permissions: check("Permissions-Policy"),
  };

  const score = Object.values(results).filter(Boolean).length * (100 / 7);

  return {
    score: Math.round(score),
    details: results,
    server: get("Server") || "Hidden",
  };
}

function analyzeHtmlContent(html: string) {
  const $ = cheerio.load(html);
  
  // SEO Basics
  const title = $("title").text();
  const description = $("meta[name='description']").attr("content") || "";
  const ogTitle = $("meta[property='og:title']").attr("content") || "";
  const ogImage = $("meta[property='og:image']").attr("content") || "";
  const canonical = $("link[rel='canonical']").attr("href") || "";

  // Content Analysis
  // Remove scripts, styles, and other non-text tags for readability
  $("script, style, noscript, iframe, svg").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  
  let readabilityScore = 0;
  let gradeLevel = "N/A";
  
  if (bodyText.length > 100) {
    try {
      readabilityScore = Math.round(readability.fleschReadingEase(bodyText));
      gradeLevel = readability.fleschKincaidGrade(bodyText).toString();
    } catch (e) {}
  }

  return {
    seo: {
      title,
      description,
      og: { title: ogTitle, image: ogImage },
      canonical,
      titleLength: title.length,
      descLength: description.length,
    },
    readability: {
      score: readabilityScore,
      grade: gradeLevel,
      wordCount: bodyText.split(/\s+/).length,
    },
    accessibility: {
      missingAlt: $("img:not([alt])").length,
      totalImgs: $("img").length,
    },
    forms: analyzeForms($),
    seoHealth: calculateSeoHealthIndex($),
  };
}

function analyzeForms($: cheerio.CheerioAPI) {
  const forms = $("form");
  const results: any[] = [];
  
  forms.each((_, el) => {
    const $form = $(el);
    const inputs = $form.find("input, select, textarea");
    const required = inputs.filter("[required]");
    
    // Form Friction calculation (simplified logic from skill)
    // 3 fields = 0 friction, 7+ = 25+ points
    let frictionScore = inputs.length * 5;
    if (inputs.length > 6) frictionScore += 15;
    
    results.push({
      action: $form.attr("action") || "local",
      method: $form.attr("method") || "get",
      fieldCount: inputs.length,
      requiredCount: required.length,
      frictionScore: Math.min(100, frictionScore),
      hasPrivacyNote: $form.text().toLowerCase().includes("privacy") || $form.text().toLowerCase().includes("data"),
    });
  });
  
  return results;
}

function calculateSeoHealthIndex($: cheerio.CheerioAPI) {
  // Weights: Crawlability 30, Technical 25, On-Page 20, Content 15, Trust 10
  let crawlability = 100;
  let technical = 100;
  let onPage = 100;
  let contentScore = 100;
  let trust = 100;

  // Deductions (Evidence-based)
  if ($("meta[name='robots'][content*='noindex']").length) crawlability -= 30;
  if (!$("link[rel='canonical']").length) onPage -= 15;
  if (!$("h1").length) onPage -= 20;
  if ($("h1").length > 1) onPage -= 5;
  
  const bodyText = $("body").text().trim();
  if (bodyText.length < 500) contentScore -= 20; // thin content
  
  if (!bodyText.toLowerCase().includes("privacy policy")) trust -= 20;

  const weighted = (crawlability * 0.3) + (technical * 0.25) + (onPage * 0.2) + (contentScore * 0.15) + (trust * 0.1);
  
  return {
    score: Math.round(weighted),
    categories: { crawlability, technical, onPage, content: contentScore, trust },
    status: weighted >= 85 ? "Excellent" : weighted >= 70 ? "Good" : weighted >= 55 ? "Fair" : "Poor"
  };
}


function detectTechStack(html: string, headers: Headers) {
  const tech = [];
  const body = html.toLowerCase();
  const server = headers.get("server")?.toLowerCase() || "";
  const xpb = headers.get("x-powered-by")?.toLowerCase() || "";

  // CMS
  if (body.includes("wp-content") || body.includes("wordpress")) tech.push("WordPress");
  if (body.includes("squarespace")) tech.push("Squarespace");
  if (body.includes("wix.com")) tech.push("Wix");
  if (body.includes("shopify")) tech.push("Shopify");
  if (body.includes("webflow")) tech.push("Webflow");

  // Frameworks/Libs
  if (body.includes("react") || body.includes("_next")) tech.push("Next.js/React");
  if (body.includes("vue.js") || body.includes("vuejs")) tech.push("Vue.js");
  if (body.includes("framer.com")) tech.push("Framer");

  // Servers/Cloud
  if (server.includes("cloudflare")) tech.push("Cloudflare");
  if (server.includes("nginx")) tech.push("Nginx");
  if (server.includes("apache")) tech.push("Apache");
  if (server.includes("vercel")) tech.push("Vercel");
  if (xpb.includes("php")) tech.push("PHP");

  return tech;
}
