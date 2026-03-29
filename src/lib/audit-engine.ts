import { CohereClient } from "cohere-ai";
import * as cheerio from "cheerio";
import readability from "text-readability";


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

  // If no API key, throw error so user can debug
  if (!apiKey) {
    throw new Error("PAGESPEED_API_KEY is missing. Please add it to your environment variables to enable real audits.");
  }

  try {
    const endpoint =
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
      `?url=${encodeURIComponent(normalizedUrl)}` +
      `&key=${apiKey}` +
      `&category=accessibility&category=best-practices&category=performance&category=seo` +
      `&strategy=mobile`;

    const response = await fetch(endpoint, { next: { revalidate: 0 } });

    if (!response.ok) {
      const body = await response.text();
      let errMsg = response.statusText;
      try {
        const parsed = JSON.parse(body);
        if (parsed.error?.message) errMsg = parsed.error.message;
      } catch (e) {}

      // Google returns a generic 500 if the site is localhost, unreachable, or blocks bots
      if (response.status === 500 && errMsg.includes("Unable to process request")) {
        errMsg = "The site is unreachable by Google's servers. Ensure the URL is public, not a localhost/private address, and doesn't explicitly block Googlebot.";
      }

      throw new Error(`PageSpeed API Error (${response.status}): ${errMsg}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("[audit-engine] PageSpeed fetch failed:", error);
    throw new Error(`Failed to run PageSpeed audit: ${error.message || "Unknown communication error"}`);
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
    You are a high-level business growth consultant for TurtleLabs. Write a clear, friendly 3-sentence executive summary
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
    
    // Safely extract scores
    const perf = Math.round(metrics?.performance ?? 0);
    const seo = Math.round(metrics?.seo ?? 0);
    const a11y = Math.round(metrics?.accessibility ?? 0);
    const bp = Math.round(metrics?.bestPractices ?? 0);
    
    // Extract audits if passed directly or via lighthouseResult
    const audits = metrics?.lighthouseResult?.audits || metrics || {};
    
    const getDisp = (key: string) => 
       audits[key]?.displayValue || audits[key] || "N/A";

    const scoreColor = (s: number) =>
      s >= 90 ? "#22c55e" : s >= 70 ? "#f97316" : "#ef4444";

    const getHostnameInner = (link: string) => {
      try {
        return /^https?:\/\//i.test(link) ? new URL(link).hostname : new URL(`https://${link}`).hostname;
      } catch(e) { return link; }
    };

    const logoUrl = `https://logo.clearbit.com/${getHostnameInner(url)}?size=128`;
    const carbon = data?.carbon;
    const security = data?.security;
    const content = data?.content;
    const tech = data?.tech;


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
            align-items: center;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 28px;
            margin-bottom: 36px;
          }
          .logo {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            margin-right: 16px;
            object-fit: cover;
          }
          .brand-container { display: flex; align-items: center; }
          .brand { font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
          .brand span { color: #3b82f6; }
          .meta { text-align: right; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; }
          .meta strong { display: block; color: #374151; font-size: 11px; margin-bottom: 4px; }
          .scores {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
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
          <div class="brand-container">
            <img src="${logoUrl}" class="logo" onerror="this.style.display='none'" />
            <div>
              <div class="brand">TurtleLabs <span>Audit</span></div>
              <div style="font-size: 9px; color: #9ca3af; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.12em;">
                Website Performance Report
              </div>
            </div>
          </div>
          <div class="meta">
            <strong>${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
            ${url}
          </div>
        </div>

        <div class="scores">
          <div class="score-card">
            <div class="score-num" style="color: ${scoreColor(metrics?.composite?.total || perf)}">${metrics?.composite?.total || perf}</div>
            <div class="score-label">Composite Score</div>
          </div>
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
          <div class="section-title">Executive Summary</div>
          <p class="summary-text">${summary}</p>
        </div>

        ${metrics?.growth ? `
        <div class="section">
          <div class="section-title">Growth Matrix Telemetry</div>
          <div class="metrics-grid">
            <div class="metric-row">
              <span class="metric-key">LTV : CAC Ratio</span>
              <span class="metric-val" style="color: ${metrics.growth.ltv_cac >= 3 ? '#22c55e' : '#f97316'}">${metrics.growth.ltv_cac}x</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Burn Multiple</span>
              <span class="metric-val" style="color: ${metrics.growth.burn_multiple <= 1.5 ? '#22c55e' : '#ef4444'}">${metrics.growth.burn_multiple}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Magic Number</span>
              <span class="metric-val">${metrics.growth.magic_number}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Estimated Runway</span>
              <span class="metric-val" style="color: ${metrics.growth.runway >= 12 ? '#22c55e' : '#f97316'}">${metrics.growth.runway} Months</span>
            </div>
          </div>
        </div>
        ` : ''}

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
            <div class="metric-row">
              <span class="metric-key">Server Response Time</span>
              <span class="metric-val">${getDisp("server-response-time")}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Total Page Weight</span>
              <span class="metric-val">${getDisp("total-byte-weight")}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">DOM Size</span>
              <span class="metric-val">${getDisp("dom-size")}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">JS Execution Time</span>
              <span class="metric-val">${getDisp("bootup-time")}</span>
            </div>
          </div>
        </div>

        ${security ? `
        <div class="section">
          <div class="section-title">Security Protocol</div>
          <div class="metrics-grid">
            <div class="metric-row">
              <span class="metric-key">Google Safe Browsing</span>
              <span class="metric-val" style="color: ${security.status === 'Clear' ? '#22c55e' : '#ef4444'}">
                ${security.status === 'Clear' ? 'Verified Safe' : 'Threat Detected'}
              </span>
            </div>
            ${security.headers ? `
            <div class="metric-row">
              <span class="metric-key">Security Headers Score</span>
              <span class="metric-val" style="color: ${scoreColor(security.headers.score)}">${security.headers.score}/100</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Server Engine</span>
              <span class="metric-val">${security.headers.server}</span>
            </div>
            ` : ''}
            ${security.threats ? `
            <div class="metric-row">
              <span class="metric-key">Detected Issues</span>
              <span class="metric-val">${security.threats.join(', ')}</span>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        ${content ? `
        <div class="section">
          <div class="section-title">Content Intelligence</div>
          <div class="metrics-grid">
            <div class="metric-row">
              <span class="metric-key">Readability (Flesch)</span>
              <span class="metric-val">${content.readability.score}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Grade Level</span>
              <span class="metric-val">${content.readability.grade}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Word Count</span>
              <span class="metric-val">${content.readability.wordCount} words</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Missing Alt Text</span>
              <span class="metric-val" style="color: ${content.accessibility.missingAlt > 0 ? '#ef4444' : '#22c55e'}">
                ${content.accessibility.missingAlt} of ${content.accessibility.totalImgs} images
              </span>
            </div>
          </div>
        </div>
        ` : ''}

        ${tech && tech.length > 0 ? `
        <div class="section">
          <div class="section-title">Technology Stack</div>
          <div style="font-size: 11px; color: #374151; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;">
            ${tech.map((t: string) => `<span style="background: #f3f4f6; padding: 4px 10px; border-radius: 6px; font-weight: 600;">${t}</span>`).join('')}
          </div>
        </div>
        ` : ''}


        ${carbon ? `
        <div class="section">
          <div class="section-title">Environmental Impact</div>
          <div class="metrics-grid">
            <div class="metric-row">
              <span class="metric-key">Carbon Footprint Status</span>
              <span class="metric-val">${carbon.green ? "A+ (Sustainable)" : "C (Standard)"}</span>
            </div>
            <div class="metric-row">
              <span class="metric-key">Cleaner Than</span>
              <span class="metric-val">${(carbon.cleanerThan * 100).toFixed(0)}% of tested sites</span>
            </div>
          </div>
        </div>
        ` : ''}

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
        client: { clientId: "turtlelabs-growth-matrix", clientVersion: "1.0.0" },
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
    console.error("[local-audit] Failed:", error);
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
