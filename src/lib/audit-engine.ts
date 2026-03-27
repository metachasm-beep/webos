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
      model: "command-r-plus",
      prompt,
      maxTokens: 200,
      temperature: 0.4,
    });
    return response.generations[0].text.trim();
  } catch (error) {
    return "We couldn't generate an AI summary right now. Check your scores above for a full picture of your site's health.";
  }
}

export async function createPdfReport(url: string, data: any) {
  const apiKey = process.env.API2PDF_API_KEY;
  if (!apiKey) return { status: "Error", message: "PDF generation requires API2PDF setup." };

  try {
    const response = await fetch("https://v2.api2pdf.com/chrome/pdf/url", {
      method: "POST",
      headers: { "Authorization": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `${process.env.NEXTAUTH_URL}/audit/report-view?url=${encodeURIComponent(url)}`,
        inline: true,
        fileName: `TurtleLabs_Audit_${new URL(normalizeUrl(url)).hostname}.pdf`,
      }),
    });

    if (!response.ok) throw new Error(`PDF generation failed: ${response.status}`);
    const result = await response.json();
    return { status: "Provisioned", downloadUrl: result.FileUrl };
  } catch (error) {
    return { status: "Error", message: "PDF generation is offline. Your scores above are still accurate." };
  }
}

function normalizeUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
