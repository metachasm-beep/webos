import { fetchPageSpeedData, generateAuditSummary, fetchCarbonMetrics, checkSafeBrowsing, runLocalAudit, fetchMultiEngineMetrics } from "@/lib/audit-engine";

import { calculateGrowthMetrics, calculateCompositeScore } from "@/lib/matrix-engine";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Server component — fully rendered HTML when API2PDF's headless Chrome arrives
export default async function ReportView({ searchParams }: Props) {
  const params = await searchParams;
  const urlParams = params.url;
  const url = Array.isArray(urlParams) ? urlParams[0] : urlParams || "";

  if (!url) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <p>No URL provided.</p>
      </div>
    );
  }

  let metrics: any = null;
  let summary = "";
  let scores = { performance: 0, seo: 0, accessibility: 0, bestPractices: 0, composite: 0 };
  let audits: any = {};

  try {
    metrics = await fetchPageSpeedData(url);
    const [carbon, security, local, multiEngine] = await Promise.all([
      fetchCarbonMetrics(url),
      checkSafeBrowsing(url),
      runLocalAudit(url),
      fetchMultiEngineMetrics(url)
    ]);

    const growth = calculateGrowthMetrics(url);
    const techMetrics = {
      lighthouse: {
        performance: Math.round(metrics.lighthouseResult.categories.performance.score * 100),
        seo: Math.round(metrics.lighthouseResult.categories.seo.score * 100),
        accessibility: Math.round(metrics.lighthouseResult.categories.accessibility.score * 100),
        bestPractices: Math.round(metrics.lighthouseResult.categories["best-practices"].score * 100),
      },
      debugbear: multiEngine?.debugbear,
      geekflare: multiEngine?.geekflare,
      observatory: multiEngine?.observatory,
      pa11y: multiEngine?.pa11y
    };
    
    const composite = calculateCompositeScore(growth, techMetrics);
    summary = await generateAuditSummary(url, metrics, { metrics: growth, score: composite });
    
    scores = {
      performance: techMetrics.lighthouse.performance,
      seo: techMetrics.lighthouse.seo,
      accessibility: techMetrics.lighthouse.accessibility,
      bestPractices: techMetrics.lighthouse.bestPractices,
      composite: composite.total,
    } as any;
    
    audits = {
        ...metrics.lighthouseResult.audits,
        growth,
        composite,
        carbon,
        security: { ...security, headers: local?.security },
        content: local?.content,
        tech: local?.tech,
        pa11y: multiEngine.pa11y,
        debugbear: multiEngine.debugbear,
        geekflare: multiEngine.geekflare,
        observatory: multiEngine.observatory
     };

  } catch (e) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <p>Failed to load audit data for <strong>{url}</strong>.</p>
      </div>
    );
  }

  const scoreColor = (s: number) =>
    s >= 90 ? "#16a34a" : s >= 70 ? "#d97706" : "#dc2626";

  const scoreBg = (s: number) =>
    s >= 90 ? "#f0fdf4" : s >= 70 ? "#fffbeb" : "#fef2f2";

  const scoreBorder = (s: number) =>
    s >= 90 ? "#bbf7d0" : s >= 70 ? "#fde68a" : "#fecaca";

  const scoreLabel = (s: number) =>
    s >= 90 ? "Excellent" : s >= 70 ? "Good" : "Needs Work";

  // Generate smart layman-friendly next steps
  const nextSteps: { icon: string; title: string; what: string; why: string; priority: "High" | "Medium" | "Low" }[] = [];
  
  if (scores.performance < 90) {
    nextSteps.push({
      icon: "⚡",
      title: "Speed Up Your Website",
      what: "Your site loads slower than ideal. Compress large images, reduce the number of scripts, and use a caching plugin.",
      why: "Slow pages lose visitors. Even a 1-second delay can reduce conversions by 7%.",
      priority: "High"
    });
  }
  if (scores.seo < 80) {
    nextSteps.push({
      icon: "🔍",
      title: "Improve Google Discoverability",
      what: "Add descriptive page titles, meta descriptions, and ensure every image has an alt text. Structure your headings (H1, H2).",
      why: "Better SEO means more people find your site without you spending on ads.",
      priority: "High"
    });
  }
  if (scores.accessibility < 80) {
    nextSteps.push({
      icon: "♿",
      title: "Make Your Site Usable for Everyone",
      what: "Add color contrast improvements, keyboard navigation support, and ARIA labels on interactive elements.",
      why: "15% of the world has a disability. Accessibility also improves your search rankings.",
      priority: "Medium"
    });
  }
  if (!audits.carbon?.green) {
    nextSteps.push({
      icon: "🌱",
      title: "Reduce Your Digital Carbon Footprint",
      what: "Host on a green provider (Vercel, Cloudflare), reduce video autoplay, and compress assets.",
      why: "The internet produces 4% of global emissions. A lighter site is also faster.",
      priority: "Low"
    });
  }
  if ((audits.security?.headers?.score || 0) < 70) {
    nextSteps.push({
      icon: "🔒",
      title: "Strengthen Website Security",
      what: "Enable HTTPS everywhere, add a Content Security Policy (CSP) header, and configure HSTS.",
      why: "Visitors and Google both penalize insecure sites. A proper security header setup takes under 30 minutes.",
      priority: "High"
    });
  }
  if ((audits.pa11y?.errors || 0) > 0) {
    nextSteps.push({
      icon: "🚨",
      title: "Fix Compliance Errors",
      what: `${audits.pa11y.errors} WCAG errors detected. Focus on form labels, link text clarity, and focus indicators.`,
      why: "WCAG compliance avoids legal risk and opens your site to a wider audience.",
      priority: "High"
    });
  }

  // Fill with at least 3 generic steps if we have fewer
  if (nextSteps.length < 3) {
    nextSteps.push({
      icon: "📊",
      title: "Set Up Analytics",
      what: "Install Google Analytics 4 or Plausible to start tracking real visitor behavior.",
      why: "You can't improve what you don't measure. Data reveals what pages to fix first.",
      priority: "Medium"
    });
  }

  const priorityColor = (p: string) => p === "High" ? "#ef4444" : p === "Medium" ? "#f97316" : "#22c55e";

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>WebOS AI Audit Report — {url}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #111827;
            padding: 48px;
            max-width: 900px;
            margin: 0 auto;
            font-size: 13px;
            line-height: 1.6;
          }

          /* HEADER */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 32px;
            margin-bottom: 40px;
            border-bottom: 2px solid #f3f4f6;
          }
          .brand-logo {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: -1px;
            text-transform: uppercase;
            color: #111827;
          }
          .brand-logo span { color: #3b82f6; }
          .brand-tagline {
            font-size: 10px;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-top: 4px;
            font-weight: 600;
          }
          .meta-box {
            text-align: right;
          }
          .meta-url {
            font-size: 11px;
            font-weight: 700;
            color: #374151;
            word-break: break-all;
          }
          .meta-date {
            font-size: 10px;
            color: #9ca3af;
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          /* COMPOSITE BANNER */
          .composite-banner {
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%);
            border-radius: 16px;
            padding: 32px 36px;
            margin-bottom: 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: white;
          }
          .composite-score-big {
            font-size: 80px;
            font-weight: 900;
            letter-spacing: -4px;
            line-height: 1;
            color: white;
          }
          .composite-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: rgba(255,255,255,0.5);
            margin-bottom: 8px;
          }
          .composite-status {
            font-size: 28px;
            font-weight: 800;
            margin-top: 8px;
          }
          .composite-desc {
            font-size: 12px;
            color: rgba(255,255,255,0.7);
            max-width: 300px;
            margin-top: 8px;
            line-height: 1.6;
          }

          /* SCORE CARDS */
          .scores {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 36px;
          }
          .score-card {
            border-radius: 12px;
            padding: 20px 16px;
            text-align: center;
          }
          .score-num {
            font-size: 42px;
            font-weight: 900;
            letter-spacing: -2px;
            line-height: 1;
          }
          .score-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: #6b7280;
            margin-top: 6px;
          }
          .score-tag {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 8px;
            opacity: 0.8;
          }

          /* SECTION HEADERS */
          .section { margin-bottom: 32px; }
          .section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
          }
          .section-icon {
            font-size: 16px;
          }
          .section-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: #374151;
          }
          .section-divider {
            flex: 1;
            height: 1px;
            background: #f3f4f6;
          }

          /* AI SUMMARY */
          .summary-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #3b82f6;
            border-radius: 0 12px 12px 0;
            padding: 20px 24px;
          }
          .summary-text {
            font-size: 13px;
            line-height: 1.8;
            color: #374151;
          }

          /* METRICS TABLE */
          .metrics-table {
            width: 100%;
            border-collapse: collapse;
          }
          .metrics-table td {
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: 12px;
          }
          .metrics-table td:first-child {
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 600;
            font-size: 10px;
            width: 50%;
          }
          .metrics-table td:last-child {
            font-weight: 700;
            color: #111827;
            text-align: right;
          }

          /* INSIGHTS GRID */
          .insights-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .insight-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 18px 20px;
          }
          .insight-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
          }
          .insight-title {
            font-size: 13px;
            font-weight: 700;
            color: #111827;
          }
          .insight-priority {
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            padding: 2px 8px;
            border-radius: 20px;
            background: #fee2e2;
            color: #dc2626;
          }
          .insight-what {
            font-size: 12px;
            color: #374151;
            line-height: 1.6;
            margin-bottom: 10px;
          }
          .insight-why-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #9ca3af;
            margin-bottom: 4px;
          }
          .insight-why {
            font-size: 11px;
            color: #6b7280;
            line-height: 1.5;
            font-style: italic;
          }

          /* TECH BADGES */
          .tech-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .tech-badge {
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            color: #374151;
          }

          /* NEXT STEPS */
          .steps-list {
            counter-reset: steps;
            list-style: none;
            space-y: 12px;
          }
          .step-item {
            display: flex;
            gap: 16px;
            padding: 16px 20px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            margin-bottom: 10px;
            align-items: flex-start;
          }
          .step-icon {
            font-size: 24px;
            flex-shrink: 0;
            line-height: 1;
            margin-top: 2px;
          }
          .step-content { flex: 1; }
          .step-title {
            font-size: 14px;
            font-weight: 800;
            color: #111827;
            margin-bottom: 4px;
          }
          .step-desc {
            font-size: 12px;
            color: #4b5563;
            line-height: 1.6;
          }
          .step-badge {
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            padding: 3px 10px;
            border-radius: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          /* FOOTER */
          .footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 2px solid #f3f4f6;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer-brand {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: #9ca3af;
          }
          .footer-brand span { color: #3b82f6; }
          .footer-note {
            font-size: 9px;
            color: #d1d5db;
            text-transform: uppercase;
            letter-spacing: 0.2em;
          }
        `}</style>
      </head>
      <body>

        {/* ── HEADER ── */}
        <div className="header">
          <div>
            <div className="brand-logo">WebOS <span>AI</span></div>
            <div className="brand-tagline">Website Intelligence Report</div>
          </div>
          <div className="meta-box">
            <div className="meta-url">{url}</div>
            <div className="meta-date">
              {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* ── COMPOSITE BANNER ── */}
        <div className="composite-banner">
          <div>
            <div className="composite-label">Overall Health Score</div>
            <div className="composite-status">{audits.composite?.status || "Analyzing..."}</div>
            <div className="composite-desc">
              Your site has been evaluated across Performance, Security, SEO, Accessibility, and Growth Potential. Here's what we found.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="composite-score-big">{scores.composite}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.15em" }}>/ 100</div>
          </div>
        </div>

        {/* ── 4 SCORE CARDS ── */}
        <div className="scores">
          {[
            { label: "Speed", score: scores.performance, icon: "⚡" },
            { label: "SEO", score: scores.seo, icon: "🔍" },
            { label: "Accessibility", score: scores.accessibility, icon: "♿" },
            { label: "Best Practices", score: scores.bestPractices, icon: "✅" },
          ].map((item) => (
            <div
              className="score-card"
              key={item.label}
              style={{
                background: scoreBg(item.score),
                border: `1px solid ${scoreBorder(item.score)}`
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>{item.icon}</div>
              <div className="score-num" style={{ color: scoreColor(item.score) }}>
                {item.score}
              </div>
              <div className="score-label">{item.label}</div>
              <div className="score-tag" style={{ color: scoreColor(item.score) }}>
                {scoreLabel(item.score)}
              </div>
            </div>
          ))}
        </div>

        {/* ── AI SUMMARY ── */}
        <div className="section">
          <div className="section-header">
            <span className="section-icon">🤖</span>
            <span className="section-title">AI Analysis Summary</span>
            <div className="section-divider" />
          </div>
          <div className="summary-box">
            <p className="summary-text">{summary}</p>
          </div>
        </div>

        {/* ── WHAT THIS MEANS: INSIGHTS ── */}
        <div className="section">
          <div className="section-header">
            <span className="section-icon">💡</span>
            <span className="section-title">What This Means For You</span>
            <div className="section-divider" />
          </div>
          <div className="insights-grid">
            {[
              {
                icon: "🚀",
                title: "Speed & First Impressions",
                what: scores.performance >= 90
                  ? "Your site loads fast — visitors get a smooth first impression."
                  : `Your site loads in a way that may test visitors' patience (Speed score: ${scores.performance}/100).`,
                why: "53% of mobile visitors leave if a page takes more than 3 seconds to load."
              },
              {
                icon: "🌐",
                title: "Google Discoverability",
                what: scores.seo >= 80
                  ? "Your SEO foundation is solid — Google can read and rank your pages well."
                  : `Your SEO has gaps that may be hiding you from search results (SEO score: ${scores.seo}/100).`,
                why: "93% of online experiences begin with a search engine."
              },
              {
                icon: "🔐",
                title: "Security & Trust",
                what: audits.security?.status === 'Clear'
                  ? "No known malware or threats detected on your domain."
                  : "Potential security risks detected. Visitors may see browser warnings.",
                why: "67% of users abandon a site that isn't HTTPS or shows security warnings."
              },
              {
                icon: "🌱",
                title: "Environmental Impact",
                what: audits.carbon?.green
                  ? "Your website runs on green energy — a great credibility signal."
                  : "Your site's carbon footprint is average for the web.",
                why: "Eco-conscious branding resonates with 78% of millennials and Gen Z."
              }
            ].map((item, i) => (
              <div className="insight-card" key={i}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "20px" }}>{item.icon}</span>
                  <span className="insight-title">{item.title}</span>
                </div>
                <p className="insight-what">{item.what}</p>
                <div className="insight-why-label">Why It Matters</div>
                <p className="insight-why">{item.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── KEY METRICS ── */}
        <div className="section">
          <div className="section-header">
            <span className="section-icon">📊</span>
            <span className="section-title">Technical Metrics</span>
            <div className="section-divider" />
          </div>
          <table className="metrics-table">
            <tbody>
              <tr>
                <td>Page Load (LCP)</td>
                <td>{audits.debugbear?.vitals?.lcp || 'Analyzing...'}</td>
              </tr>
              <tr>
                <td>Interaction Delay (FID)</td>
                <td>{audits.debugbear?.vitals?.fid || 'Analyzing...'}</td>
              </tr>
              <tr>
                <td>Visual Stability (CLS)</td>
                <td>{audits.debugbear?.vitals?.cls || 'Analyzing...'}</td>
              </tr>
              <tr>
                <td>Server Response Time (TTFB)</td>
                <td>{audits.debugbear?.vitals?.ttfb || 'Analyzing...'}</td>
              </tr>
              <tr>
                <td>Security Headers Grade</td>
                <td style={{ color: scoreColor(audits.security?.headers?.score || 0) }}>
                  {audits.security?.headers?.score || 0}/100
                </td>
              </tr>
              <tr>
                <td>Observatory Security Grade</td>
                <td style={{ fontWeight: 900, fontSize: "16px", color: (audits.observatory?.score || 0) > 70 ? '#22c55e' : '#f97316' }}>
                  {audits.observatory?.grade || 'N/A'}
                </td>
              </tr>
              <tr>
                <td>Accessibility Issues</td>
                <td style={{ color: (audits.pa11y?.errors || 0) > 0 ? '#ef4444' : '#22c55e' }}>
                  {audits.pa11y?.errors || 0} errors · {audits.pa11y?.warnings || 0} warnings
                </td>
              </tr>
              <tr>
                <td>Carbon Footprint</td>
                <td>{audits.carbon?.green ? "✅ Green Hosted" : "⚠️ Standard"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── TECH STACK ── */}
        {audits.tech && audits.tech.length > 0 && (
          <div className="section">
            <div className="section-header">
              <span className="section-icon">🛠</span>
              <span className="section-title">Detected Technology Stack</span>
              <div className="section-divider" />
            </div>
            <div className="tech-badges">
              {audits.tech.map((t: string) => (
                <span key={t} className="tech-badge">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── NEXT STEPS (LAYMAN) ── */}
        <div className="section">
          <div className="section-header">
            <span className="section-icon">🎯</span>
            <span className="section-title">Your Action Plan — What To Do Next</span>
            <div className="section-divider" />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", color: "#6b7280", fontStyle: "italic" }}>
              You don't need to be technical to act on these. Share them with your web developer or agency.
            </p>
          </div>
          {nextSteps.map((step, idx) => (
            <div className="step-item" key={idx}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-content">
                <div className="step-title">{idx + 1}. {step.title}</div>
                <div className="step-desc" style={{ marginTop: "4px" }}>{step.what}</div>
                <div style={{ marginTop: "8px", fontSize: "11px", color: "#9ca3af", fontStyle: "italic" }}>
                  📌 {step.why}
                </div>
              </div>
              <div className="step-badge" style={{
                background: step.priority === 'High' ? '#fee2e2' : step.priority === 'Medium' ? '#fef3c7' : '#d1fae5',
                color: priorityColor(step.priority)
              }}>
                {step.priority}
              </div>
            </div>
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div className="footer">
          <div className="footer-brand">WebOS <span>AI</span></div>
          <div className="footer-note">Confidential · AI-Generated Report · do not distribute</div>
          <div className="footer-note">webos-ai.com</div>
        </div>

      </body>
    </html>
  );
}
