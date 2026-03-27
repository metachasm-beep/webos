import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { metrics, url } = await req.json();

    if (!process.env.COHERE_API_KEY) {
      return NextResponse.json({ 
        summary: "Summary is unavailable. Please set the COHERE_API_KEY." 
      });
    }

    const prompt = `
    You are a professional web performance consultant writing a brief audit summary for a client.
    Write 3 clear, friendly sentences about the following website: ${url}

    Scores (out of 100):
    - Performance: ${metrics.performance}
    - SEO: ${metrics.seo}
    - Accessibility: ${metrics.accessibility}
    - Best Practices: ${metrics.bestPractices}

    Focus on: what's performing well, what needs the most improvement, and one actionable next step.
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
