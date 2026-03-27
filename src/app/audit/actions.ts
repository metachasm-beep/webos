"use server";

import { fetchPageSpeedData, generateAuditSummary, createPdfReport as createPdfReportEngine } from "@/lib/audit-engine";

export async function runAuditAction(url: string) {
  try {
    const data = await fetchPageSpeedData(url);
    const summary = await generateAuditSummary(url, data);
    
    return {
      success: true,
      metrics: {
        performance: data.lighthouseResult.categories.performance.score * 100,
        seo: data.lighthouseResult.categories.seo.score * 100,
        accessibility: data.lighthouseResult.categories.accessibility.score * 100,
        bestPractices: data.lighthouseResult.categories["best-practices"].score * 100,
      },
      summary,
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
