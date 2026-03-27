"use server";

import { fetchPageSpeedData, generateAuditSummary, createPdfReport as createPdfReportEngine, fetchCarbonMetrics, checkSafeBrowsing } from "@/lib/audit-engine";

export async function runAuditAction(url: string) {
  try {
    const data = await fetchPageSpeedData(url);
    const summary = await generateAuditSummary(url, data);
    const [carbonData, securityData] = await Promise.all([
      fetchCarbonMetrics(url),
      checkSafeBrowsing(url)
    ]);
    
    return {
      success: true,
      metrics: {
        performance: data.lighthouseResult.categories.performance.score * 100,
        seo: data.lighthouseResult.categories.seo.score * 100,
        accessibility: data.lighthouseResult.categories.accessibility.score * 100,
        bestPractices: data.lighthouseResult.categories["best-practices"].score * 100,
        lcp: data.lighthouseResult.audits["largest-contentful-paint"].displayValue,
        fid: data.lighthouseResult.audits["max-potential-fid"]?.displayValue || "N/A",
        cls: data.lighthouseResult.audits["cumulative-layout-shift"].displayValue,
      },
      summary,
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
