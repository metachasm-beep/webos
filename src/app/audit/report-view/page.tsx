import { fetchPageSpeedData, generateAuditSummary, fetchCarbonMetrics, checkSafeBrowsing, runLocalAudit } from "@/lib/audit-engine";

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
    const [carbon, security, local] = await Promise.all([
      fetchCarbonMetrics(url),
      checkSafeBrowsing(url),
      runLocalAudit(url)
    ]);

    
    const growth = calculateGrowthMetrics(url);
    const techScores = {
      performance: Math.round(metrics.lighthouseResult.categories.performance.score * 100),
      seo: Math.round(metrics.lighthouseResult.categories.seo.score * 100),
      accessibility: Math.round(metrics.lighthouseResult.categories.accessibility.score * 100),
      bestPractices: Math.round(metrics.lighthouseResult.categories["best-practices"].score * 100),
    };
    
    const composite = calculateCompositeScore(growth, techScores);
    summary = await generateAuditSummary(url, metrics, { metrics: growth, score: composite });
    
    scores = {
      ...techScores,
      composite: composite.total,
    } as any;
    
    audits = {
        ...metrics.lighthouseResult.audits,
        growth,
        composite,
        carbon,
        security: { ...security, headers: local?.security },
        content: local?.content,
        tech: local?.tech
     };

  } catch (e) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <p>Failed to load audit data for <strong>{url}</strong>.</p>
      </div>
    );
  }

  const scoreColor = (s: number) =>
    s >= 90 ? "#22c55e" : s >= 70 ? "#f97316" : "#ef4444";

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>WebOS AI Audit Report — {url}</title>
        <style>{`
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
        `}</style>
      </head>
      <body>
        {/* Header */}
        <div className="header">
          <div>
            <div className="brand">WebOS AI <span>Audit</span></div>
            <div style={{ fontSize: "9px", color: "#9ca3af", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Website Performance Report
            </div>
          </div>
          <div className="meta">
            <strong>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
            {url}
          </div>
        </div>

        {/* Scores */}
         <div className="scores">
           {[
             { label: "Composite", score: scores.composite },
             { label: "Performance", score: scores.performance },
             { label: "SEO", score: scores.seo },
             { label: "Accessibility", score: scores.accessibility },
           ].map((item) => (
             <div className="score-card" key={item.label}>
               <div className="score-num" style={{ color: scoreColor(item.score) }}>
                 {item.score}
               </div>
               <div className="score-label">{item.label}</div>
             </div>
           ))}
         </div>

        {/* AI Summary */}
        <div className="section">
          <div className="section-title">AI Summary</div>
          <p className="summary-text">{summary}</p>
        </div>

         {/* Growth Matrix */}
         <div className="section">
           <div className="section-title">Growth Matrix Telemetry</div>
           <div className="metrics-grid">
             <div className="metric-row">
               <span className="metric-key">LTV : CAC Ratio</span>
               <span className="metric-val">{audits.growth.ltv_cac}x</span>
             </div>
             <div className="metric-row">
               <span className="metric-key">Burn Multiple</span>
               <span className="metric-val">{audits.growth.burn_multiple}</span>
             </div>
             <div className="metric-row">
               <span className="metric-key">Magic Number</span>
               <span className="metric-val">{audits.growth.magic_number}</span>
             </div>
             <div className="metric-row">
               <span className="metric-key">Estimated Runway</span>
               <span className="metric-val">{audits.growth.runway} Months</span>
             </div>
           </div>
         </div>

          {/* Energy & Security */}
          <div className="section">
            <div className="section-title">Synaptic Integrity & Impact</div>
            <div className="metrics-grid">
              <div className="metric-row">
                 <span className="metric-key">Carbon Footprint</span>
                 <span className="metric-val">{audits.carbon?.green ? "A+ Sustainable" : "Standard"}</span>
              </div>
              <div className="metric-row">
                 <span className="metric-key">Security Protocol</span>
                 <span className="metric-val">{audits.security?.status === 'Clear' ? "Verified Safe" : "Risk Detected"}</span>
              </div>
              {audits.security?.headers && (
                <>
                  <div className="metric-row">
                    <span className="metric-key">Security Headers</span>
                    <span className="metric-val" style={{ color: scoreColor(audits.security.headers.score) }}>
                      {audits.security.headers.score}/100
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-key">Server Engine</span>
                    <span className="metric-val">{audits.security.headers.server}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content & Tech */}
          {audits.content && (
            <div className="section">
              <div className="section-title">Content Intelligence</div>
              <div className="metrics-grid">
                <div className="metric-row">
                  <span className="metric-key">Readability (Flesch)</span>
                  <span className="metric-val">{audits.content.readability.score}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-key">Grade Level</span>
                  <span className="metric-val">{audits.content.readability.grade}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-key">Word Count</span>
                  <span className="metric-val">{audits.content.readability.wordCount} words</span>
                </div>
                <div className="metric-row">
                  <span className="metric-key">Accessibility (Alt)</span>
                  <span className="metric-val" style={{ color: audits.content.accessibility.missingAlt > 0 ? '#ef4444' : '#22c55e' }}>
                    {audits.content.accessibility.missingAlt} issues
                  </span>
                </div>
              </div>
            </div>
          )}

          {audits.tech && audits.tech.length > 0 && (
            <div className="section">
              <div className="section-title">Technology Stack</div>
              <div style={{ fontSize: "11px", color: "#374151", display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                {audits.tech.map((t: string) => (
                  <span key={t} style={{ background: "#f3f4f6", padding: "4px 10px", borderRadius: "6px", fontWeight: "600" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

         {/* Growth Strategy */}
         <div className="section">
           <div className="section-title">Growth Strategy (AI Insights)</div>
           <div className="summary-text" style={{ fontStyle: "italic", borderLeft: "2px solid #3b82f6", paddingLeft: "1.5rem", marginTop: "1rem" }}>
             Based on your composite score of {scores.composite}, we recommend:
             <ul style={{ marginTop: "1rem" }}>
               <li style={{ marginBottom: "0.5rem" }}><strong>Technical:</strong> {scores.performance < 90 ? "Prioritize LCP and script execution optimization to bridge the performance gap." : "Maintain current performance standards; monitor Core Web Vitals for regressions."}</li>
               <li style={{ marginBottom: "0.5rem" }}><strong>Growth:</strong> {audits.growth.ltv_cac < 3 ? "Optimize CAC through improved organic SEO and high-intent landing page nodes." : "Healthy LTV:CAC detected. Focus on virality (K-factor) to accelerate distribution."}</li>
               <li style={{ marginBottom: "0.5rem" }}><strong>Impact:</strong> {audits.carbon?.green ? "Leverage your 'Green Site' status in marketing to appeal to eco-conscious segments." : "Consider edge-caching and asset compression to lower environmental impact and improve speed."}</li>
             </ul>
           </div>
         </div>

        {/* Footer */}
        <div className="footer">Generated by WebOS AI · webos-ai.com</div>
      </body>
    </html>
  );
}
