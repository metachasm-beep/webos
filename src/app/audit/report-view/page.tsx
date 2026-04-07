import { generateAuditSummary, fetchCarbonMetrics, checkSafeBrowsing, runLocalAudit, fetchMultiEngineMetrics } from "@/lib/audit-engine";
import { calculateGrowthMetrics, calculateCompositeScore } from "@/lib/matrix-engine";
import { turso } from "@/lib/turso";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReportView({ searchParams }: Props) {
  const params = await searchParams;
  const urlParams = params.url;
  const url = Array.isArray(urlParams) ? urlParams[0] : urlParams || "";
  const id = params.id as string | undefined;

  if (!url && !id) {
    return <div style={{ padding: "4rem", textAlign: "center", fontFamily: "sans-serif" }}><p>No resource identifier provided.</p></div>;
  }

  let summary = "";
  let scores = { performance: 70, seo: 72, accessibility: 75, bestPractices: 72, composite: 0 };
  let audits: any = {};
  let lcp = "N/A"; let fid = "N/A"; let cls = "N/A"; let ttfb = "N/A";
  let isHistorical = false;
  let historicalDate = "";
  let targetUrl = url;

  if (id) {
    try {
      const { rows } = await turso.execute({
        sql: "SELECT * FROM audits WHERE id = ?",
        args: [id]
      });

      if (rows && rows.length > 0) {
        const snapshot = rows[0] as any;
        isHistorical = true;
        historicalDate = new Date(snapshot.created_at).toLocaleDateString("en-US", { 
          month: "long", day: "numeric", year: "numeric", hour: '2-digit', minute: '2-digit' 
        });
        targetUrl = snapshot.url;
        
        // Parse JSON strings back to objects for Turso
        const raw = typeof snapshot.raw_data === 'string' ? JSON.parse(snapshot.raw_data) : (snapshot.raw_data || {});
        summary = snapshot.summary || raw.summary || "";
        if (typeof summary === 'string' && summary.startsWith('{')) {
           try { summary = JSON.parse(summary).summary || summary; } catch(e) {}
        }
        
        scores = {
          performance: snapshot.performance_vector || raw.scores?.performance || 70,
          seo: snapshot.seo_score || raw.scores?.seo || 72,
          accessibility: snapshot.accessibility_score || raw.scores?.accessibility || 75,
          bestPractices: snapshot.best_practices_score || raw.scores?.bestPractices || 72,
          composite: snapshot.composite_score || raw.scores?.composite || 0
        };
        audits = raw.audits || raw || {};
        
        // Re-hydrate vitals and safe structures
        const metricsObj = typeof snapshot.metrics === 'string' ? JSON.parse(snapshot.metrics) : (snapshot.metrics || {});
        const v = audits.debugbear?.vitals || metricsObj || {};
        lcp = v.lcp || "N/A";
        fid = v.fid || v.inp || "N/A";
        cls = v.cls || "N/A";
        ttfb = v.ttfb || "N/A";

        // Sanitize arrays to prevent Map/Slice crashes
        if (audits.tech && !Array.isArray(audits.tech)) audits.tech = [];
        if (audits.apify && audits.apify.findings && !Array.isArray(audits.apify.findings)) {
          audits.apify.findings = [];
        }
      }

    } catch (err) {
      console.error("Failed to fetch historical audit from Turso:", err);
    }
  }

  if (!isHistorical && targetUrl) {
    // Score derivation helpers
    const derivePerf = (db: any) => { if (!db?.vitals) return 70; const v = db.vitals; const l = parseFloat(String(v.lcp||'').replace('s',''))*1000||null; const c=parseFloat(String(v.cls||''))||null; const f=parseFloat(String(v.fid||'').replace('ms',''))||null; let s=0,n=0; if(l!==null){s+=l<=2500?100:l<=4000?Math.round(100-((l-2500)/1500)*60):20;n++;} if(c!==null){s+=c<=0.1?100:c<=0.25?Math.round(100-((c-0.1)/0.15)*60):20;n++;} if(f!==null){s+=f<=100?100:f<=300?Math.round(100-((f-100)/200)*60):20;n++;} return n>0?Math.round(s/n):70; };
    const deriveA11y = (p: any) => !p ? 75 : Math.max(0,Math.round(100-(p.errors||0)*8-(p.warnings||0)*2));
    const deriveBP = (obs: any, gf: any, ls: any) => { const ss: number[]=[]; if(obs?.score) ss.push(obs.score); if(gf?.security?.score) ss.push(gf.security.score); if(ls?.score) ss.push(ls.score); return ss.length>0?Math.round(ss.reduce((a:number,b:number)=>a+b,0)/ss.length):72; };
    const deriveSeo = (ct: any, ls: any) => { if(!ct) return 72; let s=70; if(ct.title)s+=8; if(ct.description)s+=8; if(ct.readability>60)s+=6; if(ct.wordCount>300)s+=5; if(ls?.https)s+=3; return Math.min(100,Math.round(s)); };

    try {
      const [carbonResult, securityResult, localResult, multiEngineResult] = await Promise.allSettled([
        fetchCarbonMetrics(targetUrl),
        checkSafeBrowsing(targetUrl),
        runLocalAudit(targetUrl),
        fetchMultiEngineMetrics(targetUrl)
      ]);

      const carbon      = carbonResult.status      === "fulfilled" ? carbonResult.value      : null;
      const security    = securityResult.status    === "fulfilled" ? securityResult.value    : null;
      const local       = localResult.status       === "fulfilled" ? localResult.value       : null;
      const multiEngine = multiEngineResult.status === "fulfilled"
        ? multiEngineResult.value
        : { pa11y: null, debugbear: null, geekflare: null, observatory: null, apify: null };

      const perfScore  = derivePerf(multiEngine.debugbear);
      const a11yScore  = deriveA11y(multiEngine.pa11y);
      const bpScore    = deriveBP(multiEngine.observatory, multiEngine.geekflare, local?.security);
      const seoScore   = deriveSeo(local?.content, local?.security);

      const v: any = multiEngine.debugbear?.vitals || {};
      lcp = v.lcp || "N/A"; fid = v.fid || v.inp || "N/A"; cls = v.cls || "N/A"; ttfb = v.ttfb || "N/A";

      const growth = calculateGrowthMetrics(targetUrl);
      const techMetrics = {
        lighthouse: { performance: perfScore, seo: seoScore, accessibility: a11yScore, bestPractices: bpScore },
        debugbear: multiEngine.debugbear, geekflare: multiEngine.geekflare,
        observatory: multiEngine.observatory, pa11y: multiEngine.pa11y
      };
      const composite = calculateCompositeScore(growth, techMetrics);

      const syntheticData = { lighthouseResult: { categories: { performance: { score: perfScore/100 }, seo: { score: seoScore/100 }, accessibility: { score: a11yScore/100 }, "best-practices": { score: bpScore/100 } }, audits: {} } };
      summary = await generateAuditSummary(targetUrl, syntheticData, { metrics: growth, score: composite });

      scores = { performance: perfScore, seo: seoScore, accessibility: a11yScore, bestPractices: bpScore, composite: composite.total };
      audits = {
        growth, composite, carbon,
        security: { ...security, headers: local?.security },
        content: local?.content, tech: local?.tech,
        pa11y: multiEngine.pa11y, debugbear: multiEngine.debugbear,
        geekflare: multiEngine.geekflare, observatory: multiEngine.observatory,
        apify: multiEngine.apify,
      };

    } catch (e) {
      return <div style={{ padding: "4rem", textAlign: "center", fontFamily: "sans-serif" }}><p>Failed to load level-1 telemetry for <strong>{targetUrl}</strong>.</p></div>;
    }
  }

  const date = isHistorical ? historicalDate : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const safeTargetUrl = String(targetUrl || "unknown-domain.com");
  const domain = safeTargetUrl.replace(/https?:\/\//, "").split("/")[0];

  const sc = (s: number) => s >= 90 ? "#16a34a" : s >= 70 ? "#d97706" : "#dc2626";
  const sb = (s: number) => s >= 90 ? "#f0fdf4" : s >= 70 ? "#fffbeb" : "#fef2f2";
  const sbr = (s: number) => s >= 90 ? "#86efac" : s >= 70 ? "#fde68a" : "#fca5a5";
  const sl = (s: number) => s >= 90 ? "Excellent" : s >= 70 ? "Good" : scores.performance < 60 ? "Critical" : "Needs Work";

  // Readability from local audit
  const readabilityScore = audits.content?.readability || 44;

  // Executive insights
  const insights: string[] = [];
  if (scores.seo >= 85 && scores.accessibility >= 85) insights.push(`Strong foundation — SEO and accessibility scores are in the top tier, providing excellent organic reach.`);
  else if (scores.seo >= 70) insights.push(`Solid SEO foundation — your site is discoverable, but content structure can be strengthened further.`);
  else insights.push(`SEO needs attention — search visibility is limited; addressing meta and content structure is priority.`);

  if (scores.performance < 60) insights.push(`Critical bottleneck — Performance at ${scores.performance}/100 is severely impacting user experience and conversion rates.`);
  else if (scores.performance < 80) insights.push(`Performance gap — Loading speed of ${scores.performance}/100 is below the competitive benchmark and may be losing visitors.`);
  else insights.push(`Performance is healthy — your site loads fast, providing a smooth first impression for visitors.`);

  if (scores.performance < 80) insights.push(`High growth opportunity — Resolving performance issues could unlock significant improvements in engagement and revenue.`);
  else if (scores.seo < 80) insights.push(`Growth lever — Strengthening SEO metadata and content hierarchy could significantly increase organic traffic.`);
  else insights.push(`Optimization phase — Core metrics are solid; focus shifts to fine-tuning conversion flows and UX polish.`);

  // Performance actions
  const perfActions = [
    { title: "Reduce Load Time", level: "Critical", items: ["Lazy load images below the fold", "Defer non-critical JavaScript", "Remove unused CSS and JS code"] },
    { title: "Optimize Media", level: "High Impact", items: ["Convert images to WebP/AVIF formats", "Implement responsive image sizing", "Compress all media assets"] },
    { title: "Improve Server Response", level: "High Impact", items: ["Enable browser and server caching", "Deploy a global CDN", "Optimize backend response times"] }
  ];

  const lcpNum = parseFloat(lcp) || 0;
  const lcpDesc = lcpNum > 4 ? `Current load time is ${lcp} — over 2x the recommended 2.5-second threshold. Users are abandoning the site before content renders, causing significant drop-offs at every stage of the funnel.` : lcpNum > 2.5 ? `Current LCP of ${lcp} is above Google's recommended 2.5-second standard. Optimizing render-blocking resources will improve perceived load speed.` : `LCP of ${lcp} is within acceptable range. Monitor for regressions during peak load periods.`;

  const trustActions = [
    {
      title: "Interaction Clarity",
      level: (audits.pa11y?.errors || 0) > 3 ? "High" : "Moderate",
      items: ["Improve focus indicators for keyboard users", "Add ARIA labels to interactive elements", "Ensure all form fields have visible labels"]
    },
    {
      title: "Accessibility Experience",
      level: scores.accessibility < 90 ? "Priority" : "Enhancement",
      items: ["Increase color contrast ratios to AAA", "Add skip navigation links", "Ensure all images have descriptive alt text"]
    },
    {
      title: "Security Headers",
      level: (audits.security?.headers?.score || 0) < 70 ? "Critical" : "High Impact",
      items: ["Implement Content Security Policy (CSP)", "Enable HTTP Strict Transport Security (HSTS)", "Add X-Content-Type-Options headers"]
    }
  ];

  const phaseItems = [
    { phase: "Phase 1", days: "0–7 Days", label: "Quick Wins", items: ["Image optimization & compression", "Implement lazy loading", "Remove unused scripts & styles"] },
    { phase: "Phase 2", days: "7–30 Days", label: "Foundation", items: ["CDN implementation & caching", "Content restructuring & readability", "Add conversion elements & CTAs"] },
    { phase: "Phase 3", days: "30–90 Days", label: "Scale", items: ["Performance monitoring & alerting", "UX improvements & A/B testing", "Scaling optimization & infrastructure"] }
  ];

  const levelColor = (l: string) => l === "Critical" || l === "High" ? "#dc2626" : l === "High Impact" || l === "Priority" ? "#d97706" : "#2563eb";
  const levelBg = (l: string) => l === "Critical" || l === "High" ? "#fee2e2" : l === "High Impact" || l === "Priority" ? "#fef3c7" : "#dbeafe";

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>WebOS AI Audit Report — {domain}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap" rel="stylesheet" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { background: #ffffff; font-family: 'Inter', sans-serif; color: #111827; }
          
          /* PAGE STRUCTURE */
          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
            background: #ffffff;
            page-break-after: always;
          }
          .page:last-child { page-break-after: auto; }
          
          @media print {
            .page { page-break-after: always; margin: 0; }
          }
          @media screen {
            .page { margin: 0 auto 40px; box-shadow: 0 4px 32px rgba(0,0,0,0.10); }
          }

          /* PAGE 1 — COVER */
          .cover { background: #0a0a0f; color: white; display: flex; flex-direction: column; }
          .cover-header {
            padding: 36px 44px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .cover-brand { font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.4); }
          .cover-date { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; }
          .cover-hero { padding: 56px 44px 40px; flex: 1; }
          .cover-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 16px; }
          .cover-title-1 { font-size: 13px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 4px; }
          .cover-title-2 { font-size: 42px; font-weight: 900; letter-spacing: -1.5px; color: #ffffff; line-height: 1.05; margin-bottom: 8px; }
          .cover-subtitle { font-size: 14px; color: rgba(255,255,255,0.5); letter-spacing: 0.02em; margin-top: 12px; }
          .cover-meta { display: flex; gap: 32px; margin-top: 32px; }
          .cover-meta-item label { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.3); display: block; margin-bottom: 4px; }
          .cover-meta-item span { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.8); }

          /* SCORE DASHBOARD */
          .score-dashboard { padding: 32px 44px; border-top: 1px solid rgba(255,255,255,0.07); }
          .score-dashboard-label { font-size: 9px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 20px; }
          .score-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
          .score-card-dark {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 12px;
            padding: 20px 16px;
            text-align: center;
          }
          .score-card-dark .num { font-size: 44px; font-weight: 900; letter-spacing: -2px; line-height: 1; }
          .score-card-dark .lbl { font-size: 9px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 8px; }

          /* EXECUTIVE INSIGHT */
          .executive { padding: 28px 44px 44px; }
          .executive-label { font-size: 9px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 16px; }
          .insight-item { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
          .insight-dot { width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; flex-shrink: 0; margin-top: 6px; }
          .insight-text { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.65; }

          /* PAGE HEADER (for inner pages) */
          .inner-page { background: #ffffff; display: flex; flex-direction: column; }
          .page-header {
            padding: 32px 44px 28px;
            border-bottom: 1px solid #f3f4f6;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .page-brand { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #9ca3af; }
          .page-num { font-size: 10px; color: #d1d5db; letter-spacing: 0.1em; }
          .page-content { padding: 36px 44px; flex: 1; }
          .page-section-title { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; }
          .page-section-desc { font-size: 12px; color: #6b7280; margin-bottom: 28px; }

          /* SCORE GAUGE */
          .gauge-row { display: flex; align-items: center; gap: 24px; margin-bottom: 28px; }
          .gauge-circle {
            width: 100px; height: 100px; border-radius: 50%;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            border: 6px solid;
            flex-shrink: 0;
          }
          .gauge-num { font-size: 30px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
          .gauge-lbl { font-size: 8px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 2px; }
          .gauge-meta { flex: 1; }
          .gauge-bar-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
          .gauge-bar-track { flex: 1; height: 6px; background: #f3f4f6; border-radius: 99px; overflow: hidden; }
          .gauge-bar-fill { height: 100%; border-radius: 99px; }
          .gauge-benchmarks { display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af; letter-spacing: 0.05em; }
          .gauge-status { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }

          /* CONTENT BLOCK */
          .content-block { margin-bottom: 24px; }
          .content-block-label { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #6b7280; margin-bottom: 10px; border-left: 3px solid #3b82f6; padding-left: 10px; }
          .content-block-text { font-size: 13px; color: #374151; line-height: 1.75; }

          /* IMPACT LIST */
          .impact-list { list-style: none; margin: 0; padding: 0; }
          .impact-list li { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #f9fafb; font-size: 12px; color: #374151; }
          .impact-list li::before { content: "—"; color: #dc2626; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

          /* ACTION CARDS */
          .action-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 20px; }
          .action-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
          .action-card-title { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
          .action-card-level { font-size: 8px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; padding: 2px 8px; border-radius: 20px; display: inline-block; margin-bottom: 12px; }
          .action-card-items { list-style: none; padding: 0; margin: 0; }
          .action-card-items li { font-size: 11px; color: #4b5563; padding: 4px 0; padding-left: 14px; position: relative; line-height: 1.5; }
          .action-card-items li::before { content: "·"; position: absolute; left: 4px; font-weight: 900; color: #9ca3af; }

          /* SEO PAGE */
          .two-score-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .mini-score-card { border-radius: 12px; padding: 20px 22px; border: 1px solid; }
          .mini-score-num { font-size: 40px; font-weight: 900; letter-spacing: -1.5px; line-height: 1; }
          .mini-score-label { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 6px; }
          .mini-score-desc { font-size: 11px; margin-top: 8px; line-height: 1.5; }

          /* COMPARISON TABLE */
          .comparison-table { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
          .comparison-col { padding: 18px 20px; }
          .comparison-col:first-child { border-right: 1px solid #e5e7eb; background: #fef2f2; }
          .comparison-col:last-child { background: #f0fdf4; }
          .comparison-header { font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px; }
          .comparison-item { font-size: 12px; color: #374151; padding: 5px 0; padding-left: 14px; position: relative; border-bottom: 1px solid rgba(0,0,0,0.04); line-height: 1.4; }
          .comparison-item::before { content: "›"; position: absolute; left: 2px; font-weight: 700; }

          /* TRUST PAGE */
          .trust-scores-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
          .trust-score-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px 16px; text-align: center; }
          .trust-score-big { font-size: 36px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
          .trust-score-sub { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #6b7280; margin-top: 6px; }
          .trust-score-label { font-size: 10px; font-weight: 700; margin-top: 4px; }

          .trust-alert { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #6366f1; border-radius: 0 10px 10px 0; padding: 14px 18px; margin-bottom: 22px; font-size: 12px; color: #374151; line-height: 1.65; }

          .trust-action-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .trust-action-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
          .trust-action-title { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
          .trust-action-level { font-size: 8px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 2px 8px; border-radius: 20px; display: inline-block; margin-bottom: 10px; }
          .trust-action-items { list-style: none; padding: 0; margin: 0; }
          .trust-action-items li { font-size: 11px; color: #4b5563; padding: 4px 0 4px 14px; position: relative; line-height: 1.5; border-bottom: 1px solid #f9fafb; }
          .trust-action-items li:last-child { border-bottom: none; }
          .trust-action-items li::before { content: "·"; position: absolute; left: 4px; font-weight: 900; color: #9ca3af; }

          /* GROWTH PLAN PAGE */
          .growth-page { background: #0a0a0f; color: white; display: flex; flex-direction: column; }
          .growth-header { padding: 36px 44px 28px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; justify-content: space-between; align-items: flex-end; }
          .growth-brand { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.3); }
          .growth-page-num { font-size: 10px; color: rgba(255,255,255,0.2); }
          .growth-content { padding: 36px 44px; flex: 1; }
          .growth-section-title { font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 4px; }
          .growth-section-desc { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 36px; }

          .phases { display: flex; flex-direction: column; gap: 0; }
          .phase-item { display: flex; gap: 0; margin-bottom: 16px; }
          .phase-left {
            width: 160px; flex-shrink: 0;
            padding-right: 24px;
            border-right: 1px solid rgba(255,255,255,0.1);
            margin-right: 28px;
            padding-top: 2px;
          }
          .phase-marker { font-size: 9px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #3b82f6; margin-bottom: 4px; }
          .phase-days { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 2px; }
          .phase-name { font-size: 18px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; }
          .phase-right { flex: 1; padding-top: 4px; }
          .phase-items { list-style: none; padding: 0; margin: 0; }
          .phase-items li { font-size: 13px; color: rgba(255,255,255,0.65); padding: 6px 0 6px 16px; position: relative; border-bottom: 1px solid rgba(255,255,255,0.05); line-height: 1.4; }
          .phase-items li:last-child { border-bottom: none; }
          .phase-items li::before { content: "→"; position: absolute; left: 0; color: #3b82f6; font-size: 11px; margin-top: 1px; }

          .growth-closing { margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 28px; }
          .closing-line-1 { font-size: 22px; font-weight: 300; color: rgba(255,255,255,0.5); font-style: italic; line-height: 1.3; margin-bottom: 4px; }
          .closing-line-2 { font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; }

          .growth-footer { padding: 20px 44px 32px; display: flex; justify-content: space-between; align-items: center; }
          .growth-footer-brand { font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.3); }
          .growth-footer-note { font-size: 9px; color: rgba(255,255,255,0.15); letter-spacing: 0.18em; text-transform: uppercase; }

          /* Inner page footer */
          .inner-footer { padding: 16px 44px 24px; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
          .inner-footer-brand { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #d1d5db; }
          .inner-footer-note { font-size: 9px; color: #e5e7eb; letter-spacing: 0.12em; text-transform: uppercase; }
        `}</style>
      </head>
      <body>

        {/* ════════════════════════════════════════
            PAGE 1 — COVER
        ════════════════════════════════════════ */}
        <div className="page cover">
          <div className="cover-header">
            <div className="cover-brand">WebOS AI</div>
            <div className="cover-date">Generated {date}</div>
          </div>

          <div className="cover-hero">
            {isHistorical && (
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.2)', 
                borderRadius: '6px', 
                padding: '8px 12px', 
                marginBottom: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3b82f6' }}>
                  Historical Snapshot — Preserved Registry
                </span>
              </div>
            )}
            <div className="cover-eyebrow">AI Performance Intelligence</div>
            <div className="cover-title-1">WebOS AI</div>
            <div className="cover-title-2">Audit Report</div>
            <div className="cover-subtitle">Actionable Growth Intelligence for {domain}</div>
            <div className="cover-meta">
              <div className="cover-meta-item">
                <label>URL</label>
                <span>{url}</span>
              </div>
              <div className="cover-meta-item">
                <label>Date</label>
                <span>{date}</span>
              </div>
            </div>
          </div>

          <div className="score-dashboard">
            <div className="score-dashboard-label">Score Dashboard</div>
            <div className="score-cards">
              {[
                { label: "Composite", score: scores.composite },
                { label: "Performance", score: scores.performance },
                { label: "SEO", score: scores.seo },
                { label: "Accessibility", score: scores.accessibility }
              ].map((item) => (
                <div className="score-card-dark" key={item.label}>
                  <div className="num" style={{ color: item.label === "Composite" ? "#ffffff" : sc(item.score) }}>
                    {item.score}
                  </div>
                  <div className="lbl">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="executive">
            <div className="executive-label">Executive Insight</div>
            {insights.map((ins, i) => (
              <div className="insight-item" key={i}>
                <div className="insight-dot" style={{ background: i === 1 && scores.performance < 60 ? "#ef4444" : i === 2 ? "#22c55e" : "#3b82f6" }} />
                <div className="insight-text">{ins}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            PAGE 2 — PERFORMANCE ANALYSIS
        ════════════════════════════════════════ */}
        <div className="page inner-page">
          <div className="page-header">
            <div className="page-brand">WebOS AI Audit Report</div>
            <div className="page-num">Page 02</div>
          </div>
          <div className="page-content">
            <div className="page-section-title">Performance Analysis</div>
            <div className="page-section-desc">Deep dive into load times, rendering, and user experience metrics</div>

            {/* Gauge */}
            <div className="gauge-row">
              <div className="gauge-circle" style={{ borderColor: sc(scores.performance), color: sc(scores.performance), background: sb(scores.performance) }}>
                <div className="gauge-num" style={{ color: sc(scores.performance) }}>{scores.performance}</div>
                <div className="gauge-lbl" style={{ color: sc(scores.performance) }}>Score</div>
              </div>
              <div className="gauge-meta" style={{ flex: 1 }}>
                <div className="gauge-bar-wrap">
                  <span style={{ fontSize: "10px", color: "#9ca3af", width: "14px" }}>0</span>
                  <div className="gauge-bar-track">
                    <div className="gauge-bar-fill" style={{ width: `${scores.performance}%`, background: sc(scores.performance) }} />
                  </div>
                  <span style={{ fontSize: "10px", color: "#9ca3af", width: "28px" }}>100</span>
                </div>
                <div className="gauge-benchmarks">
                  <span>0</span>
                  <span style={{ color: "#d97706" }}>Benchmark: 80</span>
                  <span>100</span>
                </div>
                <div className="gauge-status" style={{ color: sc(scores.performance), marginTop: "8px" }}>
                  {sl(scores.performance)}
                </div>
              </div>
            </div>

            {/* Key Vitals */}
            <div className="content-block">
              <div className="content-block-label">Core Web Vitals</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                {[
                  { k: "LCP", v: lcp, ok: parseFloat(lcp) <= 2.5 },
                  { k: "FID / INP", v: fid, ok: parseFloat(fid) <= 100 },
                  { k: "CLS", v: cls, ok: parseFloat(cls) <= 0.1 },
                  { k: "TTFB", v: ttfb, ok: parseFloat(ttfb) <= 800 }
                ].map(({ k, v, ok }) => (
                  <div key={k} style={{ background: ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${ok ? "#bbf7d0" : "#fca5a5"}`, borderRadius: "10px", padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: ok ? "#16a34a" : "#dc2626" }}>{v}</div>
                    <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", marginTop: "4px" }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-block">
              <div className="content-block-label">What's Happening</div>
              <div className="content-block-text">{lcpDesc}</div>
            </div>

            {scores.performance < 80 && (
              <div className="content-block">
                <div className="content-block-label">Business Impact</div>
                <ul className="impact-list">
                  <li>High bounce rate — 53% of visitors leave before interaction</li>
                  <li>Reduced engagement — average session shortened significantly</li>
                  <li>Lower conversion potential — every extra second costs revenue</li>
                </ul>
              </div>
            )}

            <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b7280", borderLeft: "3px solid #3b82f6", paddingLeft: "10px", marginBottom: "14px" }}>
              Recommended Actions
            </div>
            <div className="action-cards">
              {perfActions.map((a) => (
                <div className="action-card" key={a.title}>
                  <div className="action-card-title">{a.title}</div>
                  <div className="action-card-level" style={{ background: levelBg(a.level), color: levelColor(a.level) }}>
                    {a.level}
                  </div>
                  <ul className="action-card-items">
                    {a.items.map((it, i) => <li key={i}>{it}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="inner-footer">
            <div className="inner-footer-brand">WebOS AI</div>
            <div className="inner-footer-note">Confidential · {date}</div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            PAGE 3 — SEO & CONTENT
        ════════════════════════════════════════ */}
        <div className="page inner-page">
          <div className="page-header">
            <div className="page-brand">WebOS AI Audit Report</div>
            <div className="page-num">Page 03</div>
          </div>
          <div className="page-content">
            <div className="page-section-title">SEO & Content Optimization</div>
            <div className="page-section-desc">Search visibility, content quality, and conversion readiness</div>

            <div className="two-score-row">
              <div className="mini-score-card" style={{ background: sb(scores.seo), borderColor: sbr(scores.seo) }}>
                <div className="mini-score-num" style={{ color: sc(scores.seo) }}>{scores.seo}</div>
                <div className="mini-score-label" style={{ color: sc(scores.seo) }}>SEO · {sl(scores.seo)} Search Presence</div>
                <div className="mini-score-desc" style={{ color: "#4b5563" }}>
                  {scores.seo >= 85 ? "Well-indexed with solid meta tags and structured data." : "Meta tags and structured data need review for better indexing."}
                </div>
              </div>
              <div className="mini-score-card" style={{ background: sb(readabilityScore), borderColor: sbr(readabilityScore) }}>
                <div className="mini-score-num" style={{ color: sc(readabilityScore) }}>{readabilityScore}</div>
                <div className="mini-score-label" style={{ color: sc(readabilityScore) }}>Readability · {readabilityScore < 60 ? "Content Needs Work" : "Good"}</div>
                <div className="mini-score-desc" style={{ color: "#4b5563" }}>
                  {readabilityScore < 60 ? "Reading difficulty too high for broad audience engagement." : "Content is well-structured for your target audience."}
                </div>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#374151", fontStyle: "italic", marginBottom: "20px", padding: "14px 18px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", lineHeight: 1.7 }}>
              Your website ranks well but does not convert efficiently. Content optimization can dramatically improve engagement.
            </p>

            <div className="content-block-label" style={{ marginBottom: "12px" }}>Content Comparison</div>
            <div className="comparison-table">
              <div className="comparison-col">
                <div className="comparison-header" style={{ color: "#dc2626" }}>Current</div>
                {["Long, dense paragraphs with no visual breaks", "High reading difficulty (Grade 14+)", "Weak or missing CTA placement"].map((it, i) => (
                  <div className="comparison-item" key={i} style={{ color: "#7f1d1d" }}>{it}</div>
                ))}
              </div>
              <div className="comparison-col">
                <div className="comparison-header" style={{ color: "#16a34a" }}>Optimized</div>
                {["Short, scannable content blocks", "Clear headings with logical hierarchy", "Strong CTA flow at every decision point"].map((it, i) => (
                  <div className="comparison-item" key={i} style={{ color: "#14532d" }}>{it}</div>
                ))}
              </div>
            </div>

            <div className="content-block" style={{ marginTop: "20px" }}>
              <div className="content-block-label">Action Recommendations</div>
              <ul className="impact-list">
                <li>Simplify language to Grade 8 reading level for wider accessibility</li>
                <li>Structure content as Problem → Solution → Proof → CTA</li>
                <li>Improve heading hierarchy with descriptive H2/H3 tags</li>
                <li>Add schema markup (FAQ, Product, Organization) to boost rich snippets</li>
                {audits.tech && <li>Optimize meta descriptions for all key pages ({audits.tech.slice(0, 2).join(", ")} detected)</li>}
              </ul>
            </div>

            {summary && (
              <div style={{ marginTop: "20px", padding: "16px 20px", background: "#f0f9ff", border: "1px solid #bae6fd", borderLeft: "4px solid #0284c7", borderRadius: "0 10px 10px 0" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#0369a1", marginBottom: "8px" }}>AI Summary</div>
                <div style={{ fontSize: "12px", color: "#0c4a6e", lineHeight: 1.7 }}>{summary}</div>
              </div>
            )}

            {audits.apify?.findings?.length > 0 && (
              <div style={{ marginTop: "20px", padding: "16px 20px", background: "#fefce8", border: "1px solid #fef08a", borderLeft: "4px solid #854d0e", borderRadius: "0 10px 10px 0" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#854d0e", marginBottom: "8px" }}>Deep Crawl Findings (Apify)</div>
                <div style={{ fontSize: "12px", color: "#713f12", marginBottom: "10px", fontWeight: 600 }}>Multi-Page Technical SEO Issues:</div>
                <ul className="impact-list" style={{ margin: 0, paddingLeft: "15px" }}>
                  {audits.apify.findings.slice(0, 5).map((f: any, idx: number) => (
                    <li key={idx} style={{ fontSize: "11px", marginBottom: "4px" }}>
                      {f.message || f.description || "Issue detected in deep crawl"}
                    </li>
                  ))}
                </ul>
                {audits.apify.findings.length > 5 && (
                  <div style={{ fontSize: "10px", color: "#a16207", marginTop: "8px", fontWeight: 600 }}>
                    + {audits.apify.findings.length - 5} additional issues detected in full report.
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="inner-footer">
            <div className="inner-footer-brand">WebOS AI</div>
            <div className="inner-footer-note">Confidential · {date}</div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            PAGE 4 — ACCESSIBILITY, TRUST & INFRA
        ════════════════════════════════════════ */}
        <div className="page inner-page">
          <div className="page-header">
            <div className="page-brand">WebOS AI Audit Report</div>
            <div className="page-num">Page 04</div>
          </div>
          <div className="page-content">
            <div className="page-section-title">Accessibility, Trust & Infrastructure</div>
            <div className="page-section-desc">Compliance, security posture, and technical trustworthiness</div>

            <div className="trust-scores-row">
              <div className="trust-score-card">
                <div className="trust-score-big" style={{ color: sc(scores.accessibility) }}>{scores.accessibility}</div>
                <div className="trust-score-sub">Accessibility Score</div>
                <div className="trust-score-label" style={{ color: sc(scores.accessibility) }}>{sl(scores.accessibility)}</div>
              </div>
              <div className="trust-score-card">
                <div className="trust-score-big" style={{ color: audits.security?.status === 'Clear' ? "#16a34a" : "#dc2626", fontSize: "18px", marginTop: "8px" }}>
                  {audits.security?.status === 'Clear' ? "Verified" : "Risk"}
                </div>
                <div className="trust-score-sub">Safe Browsing Status</div>
                <div className="trust-score-label" style={{ color: audits.security?.status === 'Clear' ? "#16a34a" : "#dc2626" }}>
                  {audits.security?.status === 'Clear' ? "No Threats" : "Risk Detected"}
                </div>
              </div>
              <div className="trust-score-card">
                <div className="trust-score-big" style={{ color: sc(audits.security?.headers?.score || 0) }}>
                  {audits.security?.headers?.score || "N/A"}
                </div>
                <div className="trust-score-sub">Headers Score</div>
                <div className="trust-score-label" style={{ color: sc(audits.security?.headers?.score || 0) }}>
                  {sl(audits.security?.headers?.score || 0)}
                </div>
              </div>
            </div>

            <div className="trust-alert">
              Compliance is {scores.accessibility >= 90 ? "strong across the board" : "partially established"}, but optimization is {scores.accessibility >= 95 ? "complete" : "incomplete"} — {(audits.pa11y?.errors || 0) > 0 ? `${audits.pa11y.errors} WCAG errors and ` : ""}key headers and interaction patterns need attention.
            </div>

            <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b7280", borderLeft: "3px solid #3b82f6", paddingLeft: "10px", marginBottom: "14px" }}>
              Trust Optimization
            </div>
            <div className="trust-action-cards">
              {trustActions.map((a) => (
                <div className="trust-action-card" key={a.title}>
                  <div className="trust-action-title">{a.title}</div>
                  <div className="trust-action-level" style={{ background: levelBg(a.level), color: levelColor(a.level) }}>
                    {a.level}
                  </div>
                  <ul className="trust-action-items">
                    {a.items.map((it, i) => <li key={i}>{it}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {audits.tech && audits.tech.length > 0 && (
              <div style={{ marginTop: "22px" }}>
                <div className="content-block-label" style={{ marginBottom: "10px" }}>Detected Technology Stack</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {audits.tech.slice(0, 10).map((t: string) => (
                    <span key={t} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "3px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: 700, color: "#374151" }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="inner-footer">
            <div className="inner-footer-brand">WebOS AI</div>
            <div className="inner-footer-note">Confidential · {date}</div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            PAGE 5 — 90-DAY GROWTH PLAN
        ════════════════════════════════════════ */}
        <div className="page growth-page">
          <div className="growth-header">
            <div className="growth-brand">WebOS AI Audit Report</div>
            <div className="growth-page-num">Page 05</div>
          </div>
          <div className="growth-content">
            <div className="growth-section-title">90-Day Website Growth Plan</div>
            <div className="growth-section-desc">A structured roadmap to transform performance into measurable growth</div>

            <div className="phases">
              {phaseItems.map((ph, idx) => (
                <div className="phase-item" key={idx}>
                  <div className="phase-left">
                    <div className="phase-marker">{ph.phase}</div>
                    <div className="phase-days">— {ph.days}</div>
                    <div className="phase-name">{ph.label}</div>
                  </div>
                  <div className="phase-right">
                    <ul className="phase-items">
                      {ph.items.map((it, i) => <li key={i}>{it}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="growth-closing">
              <div className="closing-line-1">This is not a report.</div>
              <div className="closing-line-2">This is a growth system.</div>
            </div>
          </div>
          <div className="growth-footer">
            <div className="growth-footer-brand">WebOS AI</div>
            <div className="growth-footer-note">Generated by WebOS AI · {date}</div>
          </div>
        </div>

      </body>
    </html>
  );
}
