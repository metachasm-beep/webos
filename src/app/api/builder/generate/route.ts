import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.COHERE_API_KEY) {
      return NextResponse.json({ 
        error: "AI Builder requires COHERE_API_KEY authorization." 
      });
    }

    const systemPrompt = `
    [SYSTEM PROTOCOL: LANDING PAGE BUILDER]
    [OBJECTIVE: SYNTHESIZE HIGH-CONVERSION LANDING PAGE SECTION]

    INPUT PROMPT: ${prompt}

    OUTPUT SCHEMA (JSON ONLY):
    {
      "type": "hero" | "bento" | "features" | "cta",
      "heading": "String",
      "subheading": "String",
      "ctaText": "String",
      "visualData": {
        "variant": "glass" | "neon" | "minimal",
        "intensity": 0-100
      }
    }

    RULES:
    1. Response must be valid JSON only.
    2. Tone: Professional, high-end, modern.
    `;

    const response = await cohere.chat({
      model: "command-r7b-12-2024",
      message: systemPrompt,
      maxTokens: 500,
      temperature: 0.4,
    });

    const text = response.text;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonStr = text.substring(jsonStart, jsonEnd);
    
    return NextResponse.json(JSON.parse(jsonStr));
  } catch (error: any) {
    console.error("Builder Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate component" }, { status: 500 });
  }
}
