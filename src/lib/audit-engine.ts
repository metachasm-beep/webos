import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

export async function fetchPageSpeedData(url: string) {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error("PageSpeed API key not configured");
  }

  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=PWA&category=SEO&strategy=mobile`;
  
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`PageSpeed API failed with status ${response.status}`);
  }
  
  return response.json();
}

export async function generateAuditSummary(url: string, metrics: any) {
  if (!process.env.COHERE_API_KEY) return "Simulation mode active. Actual AI synthesis requires COHERE_API_KEY.";

  const prompt = `
    Analyze the following PageSpeed metrics for ${url} and provide a concise, 3-sentence "Neural Audit" summary in a futuristic, expert tone.
    Focus on areas like SEO, Performance, and UX leaks.
    
    Performance Score: ${metrics.lighthouseResult.categories.performance.score * 100}
    SEO Score: ${metrics.lighthouseResult.categories.seo.score * 100}
    Accessibility Score: ${metrics.lighthouseResult.categories.accessibility.score * 100}
  `;

  try {
    const response = await cohere.generate({
      prompt,
      maxTokens: 100,
      temperature: 0.7,
    });
    return response.generations[0].text.trim();
  } catch (error) {
    console.error("Cohere generation failed:", error);
    return "Neural synthesis offline. Metrics collected successfully.";
  }
}
