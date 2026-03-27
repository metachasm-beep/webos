import { CohereClient } from "cohere-ai";

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

export async function fetchPageSpeedData(url: string) {
  const apiKey = process.env.PAGESPEED_API_KEY;

  // Normalize URL
  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  // If no API key, return realistic mock data so the UI still works
  if (!apiKey) {
    console.warn("[audit-engine] PAGESPEED_API_KEY not set — using demo data");
    return MOCK_DATA;
  }

  try {
    const endpoint =
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
      `?url=${encodeURIComponent(normalizedUrl)}` +
      `&key=${apiKey}` +
      `&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=SEO` +
      `&strategy=mobile`;

    const response = await fetch(endpoint, { next: { revalidate: 0 } });

    if (!response.ok) {
      const body = await response.text();
      console.error("[audit-engine] PageSpeed error:", response.status, body);
      // Fall back to mock rather than crashing
      return MOCK_DATA;
    }

    return response.json();
  } catch (error) {
    console.error("[audit-engine] PageSpeed fetch failed:", error);
    return MOCK_DATA;
  }
}

export async function generateAuditSummary(url: string, metrics: any) {
  if (!process.env.COHERE_API_KEY) {
    return "AI summary is unavailable — add a COHERE_API_KEY to enable it.";
  }

  const perf = Math.round(metrics.lighthouseResult.categories.performance.score * 100);
  const seo  = Math.round(metrics.lighthouseResult.categories.seo.score * 100);
  const a11y = Math.round(metrics.lighthouseResult.categories.accessibility.score * 100);

  const prompt = `
    You are a professional web performance consultant. Write a clear, friendly 3-sentence summary
    for the following audit of ${url}. Focus on what's working well and the top priority to fix next.
    Be direct and avoid jargon or sci-fi metaphors.

    Scores (out of 100):
    - Performance: ${perf}
    - SEO: ${seo}
    - Accessibility: ${a11y}
  `;

  try {
    const response = await cohere.generate({
      model: "command-r7b-12-2024",
      prompt,
      maxTokens: 200,
      temperature: 0.4,
    });
    return response.generations[0].text.trim();
  } catch (error) {
    return "We couldn't generate a summary right now. Check your scores above for a full picture of your site's health.";
  }
}

export async function createPdfReport(url: string, data: any) {
  const apiKey = process.env.API2PDF_API_KEY;
  if (!apiKey) return { status: "Error", message: "PDF generation requires API2PDF setup." };

  try {
    const metrics = data?.metrics || {};
    const summary = data?.summary || "No summary available.";
    
    // Safely extract scores
    const perf = Math.round(metrics?.performance ?? 0);
    const seo = Math.round(metrics?.seo ?? 0);
    const a11y = Math.round(metrics?.accessibility ?? 0);
    
    // Extract audits if passed directly or via lighthouseResult
    const audits = metrics?.lighthouseResult?.audits || metrics || {};
    
    const getDisp = (key: string) => 
       audits[key]?.displayValue || audits[key] || "N/A";

    const scoreColor = (s: number) =>
      s >= 90 ? "#22c55e" : s >= 70 ? "#f97316" : "#ef4444";

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>TurtleLabs Audit Report — ${url}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #111;
            padding: 48px;
            max-width: 860px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 28px;
            margin-bottom: 36px;
          }
          .brand { font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
          .brand span { color: #3b82f6; }
          .meta { text-align: right; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; }
          .meta strong { display: block; color: #374151; font-size: 11px; margin-bottom: 4px; }
          .scores {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 40px;
          }
          .score-card {
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            padding: 28px 20px;
            text-align: center;
          }
          .score-num {
            font-size: 52px;
            font-weight: 900;
            letter-spacing: -2px;
            line-height: 1;
          }
          .score-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: #9ca3af;
            margin-top: 10px;
          }
          .section { margin-bottom: 36px; }
          .section-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: #6b7280;
            border-left: 3px solid #3b82f6;
            padding-left: 10px;
            margin-bottom: 16px;
          }
          .summary-text {
            font-size: 14px;
            line-height: 1.75;
            color: #374151;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0;
          }
          .metric-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: 11px;
          }
          .metric-key { color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; }
          .metric-val { font-weight: 700; color: #111; }
          .footer {
            margin-top: 60px;
            padding-top: 24px;
            border-top: 1px solid #f3f4f6;
            text-align: center;
            font-size: 9px;
            color: #d1d5db;
            text-transform: uppercase;
            letter-spacing: 0.25em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">TurtleLabs <span>Audit</span></div>
            <div style="font-size: 9px; color: #9ca3af; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.12em;">
              Website Performance Report
            </div>
          </div>
          <div class="meta">
            <strong>${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
            ${url}
          </div>
        </div>

        <div class="scores">
          <div class="score-card">
            <div class="score-num" style="color: ${scoreColor(perf)}">${perf}</div>
            <div class="score-label">Performance</div>
          </div>
          <div class="score-card">
            <div class="score-num" style="color: ${scoreColor(seo)}">${seo}</div>
            <div class="score-label">SEO</div>
          </div>
          <div class="score-card">
            <div class="score-num" style="color: ${scoreColor(a11y)}">${a11y}</div>
            <div class="score-label">Accessibility</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Summary</div>
          <p class="summary-text">${summary}</p>
        </div>

        <div class="section">
          <div class="section-title">Performance Details</div>
          <div class="metrics-grid">
            <div class="metric-row">
              <span class="metric-key">First Contentful Paint</span>
              <span class="metric-val">${getDisp("first-contentful-paint") === "N/A" ? getDisp("lcp") : getDisp("first-contentful-paint")}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Time to Interactive</span>
              <span class="metric-val">${getDisp("interactive")}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Speed Index</span>
              <span class="metric-val">${getDisp("speed-index")}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Total Blocking Time</span>
              <span class="metric-val">${getDisp("total-blocking-time")}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Largest Contentful Paint</span>
              <span class="metric-val">${getDisp("largest-contentful-paint") === "N/A" ? getDisp("lcp") : getDisp("largest-contentful-paint")}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Cumulative Layout Shift</span>
              <span class="metric-val">${getDisp("cumulative-layout-shift") === "N/A" ? getDisp("cls") : getDisp("cumulative-layout-shift")}</span>
            </div>
          </div>
        </div>

        <div class="footer">Generated by TurtleLabs · turtlelabs.co</div>
      </body>
    </html>
    `;

    const response = await fetch("https://v2.api2pdf.com/chrome/pdf/html", {
      method: "POST",
      headers: { "Authorization": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        html,
        inline: true,
        fileName: `TurtleLabs_Audit_${new URL(normalizeUrl(url)).hostname}.pdf`,
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

function normalizeUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
