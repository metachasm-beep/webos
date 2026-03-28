"use server";

import { fetchPageSpeedData, generateAuditSummary, createPdfReport as createPdfReportEngine, fetchCarbonMetrics, checkSafeBrowsing } from "@/lib/audit-engine";
import { calculateGrowthMetrics, calculateCompositeScore } from "@/lib/matrix-engine";

export async function runAuditAction(url: string) {
  try {
    const data = await fetchPageSpeedData(url);
    const [carbonData, securityData] = await Promise.all([
      fetchCarbonMetrics(url),
      checkSafeBrowsing(url)
    ]);

    // Integrate Growth Matrix Logic
    const growthMetrics = calculateGrowthMetrics(url);
    const techScores = {
      performance: data.lighthouseResult.categories.performance.score * 100,
      seo: data.lighthouseResult.categories.seo.score * 100,
      accessibility: data.lighthouseResult.categories.accessibility.score * 100,
      bestPractices: data.lighthouseResult.categories["best-practices"].score * 100,
    };
    
    const composite = calculateCompositeScore(growthMetrics, techScores);
    const summaryData = await generateAuditSummary(url, data, { metrics: growthMetrics, score: composite });
    
    return {
      success: true,
      metrics: {
        ...techScores,
        composite: composite,
        growth: growthMetrics,
        lcp: data.lighthouseResult.audits["largest-contentful-paint"].displayValue,
        fid: data.lighthouseResult.audits["max-potential-fid"]?.displayValue || "N/A",
        cls: data.lighthouseResult.audits["cumulative-layout-shift"].displayValue,
      },
      summary: summaryData,
      carbon: carbonData,
      security: securityData,
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
