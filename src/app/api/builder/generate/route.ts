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
        error: "Neural synthesis currently decoupled. AI Core requires authorization." 
      });
    }

    const systemPrompt = `
    [SYSTEM PROTOCOL: NEURAL NODE GENESIS]
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
    2. Tone: Professional, high-end, cinematic.
    3. Phrasing: Use 'Matrix', 'Protocol', 'Synthesis', 'Edge'.
    `;

    const response = await cohere.generate({
      model: "command-r7b-12-2024",
      prompt: systemPrompt,
      maxTokens: 500,
      temperature: 0.4,
    });

    const text = response.generations[0].text;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonStr = text.substring(jsonStart, jsonEnd);
    
    return NextResponse.json(JSON.parse(jsonStr));
  } catch (error) {
    console.error("Node Genesis Error:", error);
    return NextResponse.json({ error: "Neural Synthesis Timeout" }, { status: 500 });
  }
}
