/**
 * Pa11y Webservice Client
 * Integration for high-fidelity accessibility audits.
 * https://github.com/pa11y/pa11y-webservice
 */

const PA11Y_API = process.env.PA11Y_SERVICE_URL;

export interface Pa11yResult {
  totalIssues: number;
  errors: number;
  warnings: number;
  notices: number;
  results: any[];
  documentTitle: string;
  pageUrl: string;
}

export async function fetchPa11yMetrics(url: string): Promise<Pa11yResult | null> {
  try {
    // 1. Check if task exists for this URL
    const tasksResp = await fetch(`${PA11Y_API}/tasks`, { next: { revalidate: 0 } });
    if (!tasksResp.ok) return null;
    const tasks = await tasksResp.json();
    
    let task = tasks.find((t: any) => t.url === url);
    
    // 2. Create task if it doesn't exist
    if (!task) {
      const createResp = await fetch(`${PA11Y_API}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, name: `WebOS Audit: ${new URL(url).hostname}` })
      });
      if (createResp.ok) task = await createResp.json();
    }
    
    if (!task) return null;

    // 3. Trigger a new run (Async in background, but we'll try to fetch latest)
    await fetch(`${PA11Y_API}/tasks/${task.id}/runs`, { method: "POST" });
    
    // 4. Get the latest results
    const resultsResp = await fetch(`${PA11Y_API}/tasks/${task.id}/results`, { next: { revalidate: 0 } });
    if (!resultsResp.ok) return null;
    const allResults = await resultsResp.json();
    
    if (allResults.length === 0) return null;
    const latest = allResults[0];

    const issues = latest.results || [];
    const errors = issues.filter((i: any) => i.type === "error").length;
    const warnings = issues.filter((i: any) => i.type === "warning").length;
    const notices = issues.filter((i: any) => i.type === "notice").length;

    return {
      totalIssues: issues.length,
      errors,
      warnings,
      notices,
      results: issues.slice(0, 10), // Limit to top 10 for report size
      documentTitle: latest.documentTitle,
      pageUrl: latest.pageUrl
    };

  } catch (error) {
    console.error("[pa11y-client] Error:", error);
    return null;
  }
}
