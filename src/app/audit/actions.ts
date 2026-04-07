"use server";

import {
  generateAuditSummary,
  createPdfReport as createPdfReportEngine,
  fetchCarbonMetrics,
  checkSafeBrowsing,
  runLocalAudit,
  fetchMultiEngineMetrics
} from "@/lib/audit-engine";

import { calculateGrowthMetrics, calculateCompositeScore } from "@/lib/matrix-engine";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Derive a performance score from DebugBear vitals.
 * Uses a simplified Core Web Vitals heuristic:
 *   LCP < 2.5s = 100pts, > 4s = 0pts
 *   CLS < 0.1 = 100pts, > 0.25 = 0pts
 *   FID/INP < 100ms = 100pts, > 300ms = 0pts
 */
function derivePerformanceScore(debugbear: any): number {
  if (!debugbear?.vitals) return 70; // neutral default

  const vitals = debugbear.vitals;
  const lcpMs = parseFloat(String(vitals.lcp || "").replace("s", "")) * 1000 || null;
  const cls   = parseFloat(String(vitals.cls || "")) || null;
  const fidMs = parseFloat(String(vitals.fid || "").replace("ms", "")) || null;

  let score = 0;
  let count = 0;

  if (lcpMs !== null) {
    score += lcpMs <= 2500 ? 100 : lcpMs <= 4000 ? Math.round(100 - ((lcpMs - 2500) / 1500) * 60) : 20;
    count++;
  }
  if (cls !== null) {
    score += cls <= 0.1 ? 100 : cls <= 0.25 ? Math.round(100 - ((cls - 0.1) / 0.15) * 60) : 20;
    count++;
  }
  if (fidMs !== null) {
    score += fidMs <= 100 ? 100 : fidMs <= 300 ? Math.round(100 - ((fidMs - 100) / 200) * 60) : 20;
    count++;
  }

  return count > 0 ? Math.round(score / count) : 70;
}

/**
 * Derive an accessibility score from Pa11y results.
 * 0 errors = 100, scales down by error count.
 */
function deriveAccessibilityScore(pa11y: any): number {
  if (!pa11y) return 75;
  const errors = pa11y.errors || 0;
  const warnings = pa11y.warnings || 0;
  const raw = Math.max(0, 100 - (errors * 8) - (warnings * 2));
  return Math.round(raw);
}

/**
 * Derive a security / best-practices score from Observatory + Geekflare + local headers.
 */
function deriveBestPracticesScore(observatory: any, geekflare: any, localSecurity: any): number {
  const scores: number[] = [];
  if (observatory?.score && typeof observatory.score === "number") scores.push(observatory.score);
  if (geekflare?.security?.score && typeof geekflare.security.score === "number") scores.push(geekflare.security.score);
  if (localSecurity?.score && typeof localSecurity.score === "number") scores.push(localSecurity.score);
  if (scores.length === 0) return 72;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/**
 * Derive an SEO score from local audit data (meta tags, OG, headings, readability).
 */
function deriveSeoScore(content: any, localSecurity: any): number {
  if (!content) return 72;
  let score = 70;
  if (content.title)       score += 8;
  if (content.description) score += 8;
  if (content.readability && content.readability > 60) score += 6;
  if (content.wordCount && content.wordCount > 300)    score += 5;
  if (localSecurity?.https) score += 3;
  return Math.min(100, Math.round(score));
}

export async function runAuditAction(url: string) {
  try {
    // Run all engines in parallel — none depend on PageSpeed
    const [carbonResult, securityResult, localResult, multiEngineResult] = await Promise.allSettled([
      fetchCarbonMetrics(url),
      checkSafeBrowsing(url),
      runLocalAudit(url),
      fetchMultiEngineMetrics(url)
    ]);

    const carbonData      = carbonResult.status      === "fulfilled" ? carbonResult.value      : null;
    const securityData    = securityResult.status    === "fulfilled" ? securityResult.value    : null;
    const localData       = localResult.status       === "fulfilled" ? localResult.value       : null;
    const multiEngineData = multiEngineResult.status === "fulfilled"
      ? multiEngineResult.value
      : { pa11y: null, debugbear: null, geekflare: null, observatory: null, apify: null };

    // Derive all scores from available engines (no PageSpeed)
    const performanceScore  = derivePerformanceScore(multiEngineData.debugbear);
    const accessibilityScore = deriveAccessibilityScore(multiEngineData.pa11y);
    const bestPracticesScore = deriveBestPracticesScore(multiEngineData.observatory, multiEngineData.geekflare, localData?.security);
    const seoScore           = deriveSeoScore(localData?.content, localData?.security);

    // Pull Core Web Vitals from DebugBear
    const vitals: any = multiEngineData.debugbear?.vitals || {};
    const lcp = vitals.lcp || "N/A";
    const fid = vitals.fid || vitals.inp || "N/A";
    const cls = vitals.cls || "N/A";
    const ttfb = vitals.ttfb || "N/A";

    const growthMetrics = calculateGrowthMetrics(url);
    const techMetrics = {
      lighthouse: {
        performance:    performanceScore,
        seo:            seoScore,
        accessibility:  accessibilityScore,
        bestPractices:  bestPracticesScore,
      },
      debugbear:   multiEngineData.debugbear,
      geekflare:   multiEngineData.geekflare,
      observatory: multiEngineData.observatory,
      pa11y:       multiEngineData.pa11y,
    };

    const composite = calculateCompositeScore(growthMetrics, techMetrics);

    // AI summary — pass a synthetic "metrics" object that mirrors what generateAuditSummary expects
    const syntheticAuditData = {
      lighthouseResult: {
        categories: {
          performance:       { score: performanceScore / 100 },
          seo:               { score: seoScore / 100 },
          accessibility:     { score: accessibilityScore / 100 },
          "best-practices":  { score: bestPracticesScore / 100 },
        },
        audits: {
          "largest-contentful-paint": { displayValue: lcp },
          "cumulative-layout-shift":  { displayValue: cls },
          "max-potential-fid":         { displayValue: fid },
        }
      }
    };
    const summaryData = await generateAuditSummary(url, syntheticAuditData, { metrics: growthMetrics, score: composite });

    const result = {
      success: true,
      metrics: {
        performance:   performanceScore,
        seo:           seoScore,
        accessibility: accessibilityScore,
        bestPractices: bestPracticesScore,
        composite,
        growth: growthMetrics,
        lcp, fid, cls, ttfb,
      },
      summary: summaryData,
      carbon:  carbonData,
      security: {
        ...securityData,
        headers: localData?.security
      },
      content: localData?.content,
      tech:    localData?.tech,
      observatory: multiEngineData.observatory,
      apify:       multiEngineData.apify,
      pa11y:       multiEngineData.pa11y,
      debugbear:   multiEngineData.debugbear,
      geekflare:   multiEngineData.geekflare,
    };

    // Persistence (silent — never blocks result)
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        await supabase.from("audits").insert({
          user_email:           session.user.email,
          url,
          composite_score:      composite.total,
          status:               composite.status,
          performance_vector:   composite.breakdown.vectors.performance,
          security_vector:      composite.breakdown.vectors.security,
          compliance_vector:    composite.breakdown.vectors.compliance,
          accessibility_score:  accessibilityScore,
          seo_score:            seoScore,
          best_practices_score: bestPracticesScore,
          summary:              summaryData,
          metrics: {
            pa11y:       multiEngineData.pa11y?.totalIssues,
            debugbear:   multiEngineData.debugbear?.performance,
            geekflare:   multiEngineData.geekflare?.security?.score,
            observatory: multiEngineData.observatory?.score,
            ...growthMetrics, // Add growth metrics for archive context
          },
          raw_data:             result, // Store the FULL enriched result
          created_at: new Date().toISOString()
        });
      }
    } catch (persistError) {
      console.warn("Audit Registry out of sync. Proceeding with ephemeral report.", persistError);
    }

    return result;

  } catch (error: any) {
    console.error("Audit failed:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during synthesis.",
    };
  }
}

export async function createPdfReport(url: string, data: any) {
  return await createPdfReportEngine(url, data);
}
