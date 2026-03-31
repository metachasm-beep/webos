"use server";

import { fetchPageSpeedData, generateAuditSummary, createPdfReport as createPdfReportEngine, fetchCarbonMetrics, checkSafeBrowsing, runLocalAudit, fetchMultiEngineMetrics } from "@/lib/audit-engine";

import { calculateGrowthMetrics, calculateCompositeScore } from "@/lib/matrix-engine";

export async function runAuditAction(url: string) {
  try {
    const data = await fetchPageSpeedData(url);
    const [carbonData, securityData, localData, multiEngineData] = await Promise.all([
      fetchCarbonMetrics(url),
      checkSafeBrowsing(url),
      runLocalAudit(url),
      fetchMultiEngineMetrics(url)
    ]);


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
    
    return {
      success: true,
      metrics: {
        performance: techMetrics.lighthouse.performance,
        seo: techMetrics.lighthouse.seo,
        accessibility: techMetrics.lighthouse.accessibility,
        bestPractices: techMetrics.lighthouse.bestPractices,
        composite: composite,
        growth: growthMetrics,
        lcp: data.lighthouseResult.audits["largest-contentful-paint"].displayValue,
        fid: data.lighthouseResult.audits["max-potential-fid"]?.displayValue || "N/A",
        cls: data.lighthouseResult.audits["cumulative-layout-shift"].displayValue,
      },
      summary: summaryData,
      carbon: carbonData,
      security: {
        ...securityData,
        headers: localData?.security
      },
      content: localData?.content,
      tech: localData?.tech,
      pa11y: multiEngineData.pa11y,
      debugbear: multiEngineData.debugbear,
      geekflare: multiEngineData.geekflare,
      observatory: multiEngineData.observatory,
    };

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
