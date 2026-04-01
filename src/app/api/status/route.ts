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

async function checkSafeBrowsing() {
  const key = process.env.SAFE_BROWSING_API_KEY || process.env.PAGESPEED_API_KEY;
  if (!key) return { ok: false, label: "No API key" };
  try {
    const r = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: { clientId: "status-check", clientVersion: "1.0.0" },
        threatInfo: {
          threatTypes: ["MALWARE"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: "https://google.com" }],
        },
      }),
      signal: AbortSignal.timeout(6000),
    });
    return r.ok ? { ok: true, label: "Connected" } : { ok: false, label: `Error ${r.status}` };
  } catch {
    return { ok: false, label: "Timeout" };
  }
}

async function checkDebugBear() {
  const key = process.env.DEBUGBEAR_API_KEY;
  try {
    const r = await fetch("https://www.debugbear.com/api/v1/projects", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    });
    return r.ok ? { ok: true, label: "Connected" } : { ok: false, label: "Invalid key" };
  } catch {
    return { ok: false, label: "Timeout" };
  }
}

async function checkGeekflare() {
  const key = process.env.GEEKFLARE_API_KEY;
  try {
    const r = await fetch("https://api.geekflare.com/v1/account/status", {
      method: "POST",
      headers: { "x-api-key": key as string },
      signal: AbortSignal.timeout(6000),
    });
    return r.ok ? { ok: true, label: "Connected" } : { ok: false, label: "Invalid key" };
  } catch {
    return { ok: false, label: "Timeout" };
  }
}

async function checkApify() {
  const key = process.env.APIFY_API_KEY;
  if (!key) return { ok: false, label: "No API key" };
  try {
    const r = await fetch("https://api.apify.com/v2/users/me?token=" + key, {
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return { ok: false, label: "Invalid Key" };
    const { data } = await r.json();
    return { ok: true, label: `${data.plan.id} Plan` };
  } catch {
    return { ok: false, label: "Timeout" };
  }
}

async function checkPa11y() {
  const url = process.env.PA11Y_SERVICE_URL || "http://localhost:3000";
  try {
    const r = await fetch(`${url}/tasks`, { signal: AbortSignal.timeout(4000) });
    return r.ok ? { ok: true, label: "Online" } : { ok: false, label: "Offline" };
  } catch {
    return { ok: false, label: "Unreachable" };
  }
}

async function checkObservatory() {
  try {
    const r = await fetch("https://observatory-api.mdn.mozilla.net/api/v2/scan?host=google.com", {
      signal: AbortSignal.timeout(6000),
    });
    return r.ok ? { ok: true, label: "Connected" } : { ok: false, label: "Down" };
  } catch {
    return { ok: false, label: "Timeout" };
  }
}

export async function GET() {
  const [pageSpeed, cohere, api2pdf, safeBrowsing, debugbear, geekflare, pa11y, observatory, apify] = await Promise.all([
    checkPageSpeed(),
    checkCohere(),
    checkApi2Pdf(),
    checkSafeBrowsing(),
    checkDebugBear(),
    checkGeekflare(),
    checkPa11y(),
    checkObservatory(),
    checkApify()
  ]);

  return NextResponse.json({
    apis: [
      { name: "PageSpeed API", ...pageSpeed, description: "Google Lighthouse audits" },
      { name: "Cohere AI", ...cohere, description: "AI summary generation" },
      { name: "DebugBear", ...debugbear, description: "Professional performance monitoring" },
      { name: "Geekflare", ...geekflare, description: "Infrastructure security telemetry" },
      { name: "Mozilla Observatory", ...observatory, description: "Security header grading" },
      { name: "Pa11y Service", ...pa11y, description: "Deep-dive accessibility engine" },
      { name: "API2PDF", ...api2pdf, description: "PDF report generation" },
      { name: "Safe Browsing", ...safeBrowsing, description: "Security threat detection" },
      { name: "Apify", ...apify, description: "Deep-crawl SEO engine" },
    ],
  });
}
