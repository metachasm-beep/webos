/**
 * Apify Client
 * Handles actor triggering and dataset retrieval.
 */

export interface ApifyActorRun {
  id: string;
  actId: string;
  status: string;
  defaultDatasetId: string;
}

export interface ApifyResult {
  success: boolean;
  data?: any[];
  error?: string;
}

const APIFY_BASE_URL = "https://api.apify.com/v2";

export async function runApifyActor(actorId: string, input: any): Promise<ApifyActorRun | null> {
  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`${APIFY_BASE_URL}/acts/${actorId}/runs?token=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      console.error(`[Apify] Failed to trigger actor ${actorId}:`, response.status);
      return null;
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error(`[Apify] Error triggering actor ${actorId}:`, error);
    return null;
  }
}

export async function waitForApifyRun(runId: string, timeoutMs: number = 60000): Promise<boolean> {
  const apiKey = process.env.APIFY_API_KEY;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}?token=${apiKey}`);
      const { data } = await response.json();
      
      if (data.status === "SUCCEEDED") return true;
      if (data.status === "FAILED" || data.status === "ABORTED" || data.status === "TIMED-OUT") return false;

      // Wait 3 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      return false;
    }
  }

  return false;
}

export async function getApifyDataset(datasetId: string): Promise<any[]> {
  const apiKey = process.env.APIFY_API_KEY;
  try {
    const response = await fetch(`${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${apiKey}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
}
