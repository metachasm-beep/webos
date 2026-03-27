import { fetchPageSpeedData, generateAuditSummary } from "@/lib/audit-engine";

interface Props {
  searchParams: { url?: string };
}

// Server component — fully rendered HTML when API2PDF's headless Chrome arrives
export default async function ReportView({ searchParams }: Props) {
  const url = searchParams.url || "";

  if (!url) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <p>No URL provided.</p>
      </div>
    );
  }

  let metrics: any = null;
  let summary = "";
  let scores = { performance: 0, seo: 0, accessibility: 0 };
  let audits: any = {};

  try {
    metrics = await fetchPageSpeedData(url);
    summary = await generateAuditSummary(url, metrics);
    scores = {
      performance: Math.round(metrics.lighthouseResult.categories.performance.score * 100),
      seo: Math.round(metrics.lighthouseResult.categories.seo.score * 100),
      accessibility: Math.round(metrics.lighthouseResult.categories.accessibility.score * 100),
    };
    audits = metrics.lighthouseResult.audits || {};
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
        <title>TurtleLabs Audit Report — {url}</title>
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
        `}</style>
      </head>
      <body>
        {/* Header */}
        <div className="header">
          <div>
            <div className="brand">TurtleLabs <span>Audit</span></div>
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

        {/* Core Web Vitals */}
        <div className="section">
          <div className="section-title">Performance Details</div>
          <div className="metrics-grid">
            {[
              { key: "First Contentful Paint", val: audits["first-contentful-paint"]?.displayValue },
              { key: "Time to Interactive", val: audits["interactive"]?.displayValue },
              { key: "Speed Index", val: audits["speed-index"]?.displayValue },
              { key: "Total Blocking Time", val: audits["total-blocking-time"]?.displayValue },
              { key: "Largest Contentful Paint", val: audits["largest-contentful-paint"]?.displayValue },
              { key: "Cumulative Layout Shift", val: audits["cumulative-layout-shift"]?.displayValue },
            ]
              .filter((m) => m.val)
              .map((m) => (
                <div className="metric-row" key={m.key}>
                  <span className="metric-key">{m.key}</span>
                  <span className="metric-val">{m.val}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="footer">Generated by TurtleLabs · turtlelabs.co</div>
      </body>
    </html>
  );
}
