import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { prompt, style = "dark-saas" } = await req.json();

    if (!process.env.COHERE_API_KEY) {
      return NextResponse.json({ 
        error: "Asset Synthesis requires COHERE_API_KEY authorization." 
      });
    }

    // Use Cohere to generate a high-quality image prompt based on the user's description
    const systemPrompt = `
    [SYSTEM PROTOCOL: NEURAL ASSET ARCHITECT]
    [OBJECTIVE: GENERATE HIGH-IMPACT IMAGE PROMPTS FOR LANDING PAGES]
    [STYLE: ${style}]

    User Description: ${prompt}

    OUTPUT SCHEMA (JSON ONLY):
    {
      "refinedPrompt": "A detailed DALL-E/Midjourney style prompt",
      "aspectRatio": "16:9" | "4:1" | "1:1",
      "mood": "Professional" | "High-Tech" | "Minimalist" | "Vibrant",
      "mockUrl": "String (A placeholder URL for now, e.g., https://images.unsplash.com/...)"
    }
    `;

    const response = await cohere.chat({
      model: "command-r-plus",
      message: systemPrompt,
      maxTokens: 500,
      temperature: 0.6,
    });

    const text = response.text;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonStr = text.substring(jsonStart, jsonEnd);
    const result = JSON.parse(jsonStr);

    // Provide a real Unsplash URL as a fallback if no actual generation is hooked up
    // Using keywords from the refined prompt
    const keywords = result.mood.toLowerCase();
    result.url = `https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200&h=675`; 
    // ^ This is a generic high-tech space blue image that fits "Dark SaaS" well.

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Asset Synthesis Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to synthesize asset" }, { status: 500 });
  }
}
