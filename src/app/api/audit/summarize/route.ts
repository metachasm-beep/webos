import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { metrics, url, growth } = await req.json();

    if (!process.env.COHERE_API_KEY) {
      return NextResponse.json({ 
        summary: "Summary is unavailable. Please set the COHERE_API_KEY." 
      });
    }

    let growthContext = "";
    if (growth) {
      growthContext = `
      Business Growth Matrix:
      - Composite Growth Score: ${growth.score.total}/100 (${growth.score.status})
      - LTV:CAC Ratio: ${growth.metrics.ltv_cac}
      - Burn Multiple: ${growth.metrics.burn_multiple}
      - Runway: ${growth.metrics.runway} months
      `;
    }

    const prompt = `
    You are a high-level business growth consultant for TurtleLabs. Write a clear, friendly 3-sentence executive summary
    for the following audit of ${url}. 
    
    Incorporate both the Technical Health and the Business Growth Matrix in your synthesis.
    Focus on the relationship between technical performance and business efficiency.

    Technical Scores (out of 100):
    - Performance: ${metrics.performance}
    - SEO: ${metrics.seo}
    - Accessibility: ${metrics.accessibility}
    - Best Practices: ${metrics.bestPractices}

    ${growthContext}

    Keep it simple, direct, and professional. No jargon or sci-fi terms.
    `;

    const response = await cohere.chat({
      model: "command-r7b-12-2024",
      message: prompt,
      maxTokens: 300,
      temperature: 0.4,
    });

    return NextResponse.json({ summary: response.text.trim() });
  } catch (error: any) {
    console.error("AI Synthesis Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to connect to Cohere API" }, 
      { status: 500 }
    );
  }
}
