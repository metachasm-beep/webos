"use server";

import { fetchPageSpeedData, generateAuditSummary, createPdfReport as createPdfReportEngine, fetchCarbonMetrics, checkSafeBrowsing, runLocalAudit, fetchMultiEngineMetrics } from "@/lib/audit-engine";

import { calculateGrowthMetrics, calculateCompositeScore } from "@/lib/matrix-engine";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function runAuditAction(url: string) {
  try {
    const data = await fetchPageSpeedData(url);

    // Use allSettled so one failing engine never kills the whole audit
    const [carbonResult, securityResult, localResult, multiEngineResult] = await Promise.allSettled([
      fetchCarbonMetrics(url),
      checkSafeBrowsing(url),
      runLocalAudit(url),
      fetchMultiEngineMetrics(url)
    ]);

    const carbonData    = carbonResult.status      === "fulfilled" ? carbonResult.value      : null;
    const securityData  = securityResult.status    === "fulfilled" ? securityResult.value    : null;
    const localData     = localResult.status       === "fulfilled" ? localResult.value       : null;
    const multiEngineData = multiEngineResult.status === "fulfilled" ? multiEngineResult.value : { pa11y: null, debugbear: null, geekflare: null, observatory: null };



    // Integrate High-Fidelity Multi-Engine Scoring
    const growthMetrics = calculateGrowthMetrics(url);
    const techMetrics = {
      lighthouse: {
        performance: data.lighthouseResult.categories.performance.score * 100,
        seo: data.lighthouseResult.categories.seo.score * 100,
        accessibility: data.lighthouseResult.categories.accessibility.score * 100,
        bestPractices: data.lighthouseResult.categories["best-practices"].score * 100,
      },
      debugbear: multiEngineData?.debugbear,
      geekflare: multiEngineData?.geekflare,
      observatory: multiEngineData?.observatory,
      pa11y: multiEngineData?.pa11y
    };
    
    const composite = calculateCompositeScore(growthMetrics, techMetrics);
    const summaryData = await generateAuditSummary(url, data, { metrics: growthMetrics, score: composite });
    
    const result = {
      success: true,
      degraded: data._degraded || false,
      degradedReason: data._degradedReason || null,
      metrics: {
        performance: techMetrics.lighthouse.performance,
        seo: techMetrics.lighthouse.seo,
        accessibility: techMetrics.lighthouse.accessibility,
        bestPractices: techMetrics.lighthouse.bestPractices,
        composite: composite,
        growth: growthMetrics,
        lcp: data.lighthouseResult.audits?.["largest-contentful-paint"]?.displayValue || "N/A",
        fid: data.lighthouseResult.audits?.["max-potential-fid"]?.displayValue || "N/A",
        cls: data.lighthouseResult.audits?.["cumulative-layout-shift"]?.displayValue || "N/A",
      },
      summary: summaryData,
      carbon: carbonData,
      security: {
        ...securityData,
        headers: localData?.security
      },
      content: localData?.content,
      tech: localData?.tech,
      observatory: multiEngineData.observatory,
    };

    // 4. Persistence Registry Sync (Silent)
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        await supabase.from('audits').insert({
          user_email: session.user.email,
          url,
          composite_score: composite.total,
          status: composite.status,
          performance_vector: composite.breakdown.vectors.performance,
          security_vector: composite.breakdown.vectors.security,
          compliance_vector: composite.breakdown.vectors.compliance,
          summary: summaryData,
          metrics: {
            pa11y: multiEngineData.pa11y?.totalIssues,
            debugbear: multiEngineData.debugbear?.performance,
            geekflare: multiEngineData.geekflare?.security?.score,
            observatory: multiEngineData.observatory?.score
          },
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
