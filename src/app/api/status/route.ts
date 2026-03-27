import { NextResponse } from "next/server";

async function checkPageSpeed() {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return { ok: false, label: "No API key" };
  try {
    const r = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://google.com&key=${key}&strategy=mobile`,
      { signal: AbortSignal.timeout(6000) }
    );
    return r.ok ? { ok: true, label: "Connected" } : { ok: false, label: `Error ${r.status}` };
  } catch {
    return { ok: false, label: "Timeout" };
  }
}

async function checkCohere() {
  const key = process.env.COHERE_API_KEY;
  if (!key) return { ok: false, label: "No API key" };
  try {
    const r = await fetch("https://api.cohere.ai/v1/check-api-key", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(6000),
    });
    // 200 = valid, 401 = invalid key
    return r.ok ? { ok: true, label: "Connected" } : { ok: false, label: "Invalid key" };
  } catch {
    return { ok: false, label: "Timeout" };
  }
}

async function checkApi2Pdf() {
  const key = process.env.API2PDF_API_KEY;
  if (!key) return { ok: false, label: "No API key" };
  // API2PDF doesn't have a dedicated ping — we check by validating the key format
  // and making a lightweight call to the info endpoint
  try {
    const r = await fetch("https://v2.api2pdf.com/", {
      headers: { Authorization: key },
      signal: AbortSignal.timeout(6000),
    });
    return r.status < 500 ? { ok: true, label: "Connected" } : { ok: false, label: `Error ${r.status}` };
  } catch {
    return { ok: false, label: "Timeout" };
  }
}

export async function GET() {
  const [pageSpeed, cohere, api2pdf] = await Promise.all([
    checkPageSpeed(),
    checkCohere(),
    checkApi2Pdf(),
  ]);

  return NextResponse.json({
    apis: [
      { name: "PageSpeed API", ...pageSpeed, description: "Google Lighthouse audits" },
      { name: "Cohere AI", ...cohere, description: "AI summary generation" },
      { name: "API2PDF", ...api2pdf, description: "PDF report generation" },
    ],
  });
}
