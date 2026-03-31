import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { brandDescription, logoColors } = await req.json();

    if (!process.env.COHERE_API_KEY) {
      return NextResponse.json({ error: "Neural Theme Synth requires COHERE_API_KEY." }, { status: 401 });
    }

    const systemPrompt = `
    [SYSTEM ROLE: NEURAL DESIGN ARCHITECT]
    [OBJECTIVE: SYNTHESIZE HIGH-FIDELITY DESIGN SYSTEM TOKENS]
    
    BRAND CONTEXT: "${brandDescription}"
    LOGO TELESCOPY: ${JSON.stringify(logoColors || [])}

    OUTPUT: RAW JSON ONLY.
    SCHEMA: { 
      "primary": "oklch(L C H)", 
      "accent": "oklch(L C H)", 
      "bg": "oklch(L C H)", 
      "headingFont": "classic" | "modern" | "elegant",
      "radius": "String (px)",
      "glass": 0-100 
    }

    DESIGN RULES:
    1. OKLCH primary must be high chroma.
    2. Accent must be complementary to primary.
    3. Background must be extremely dark for low-light SaaS high-fidelity.
    4. Text-Readability (Contrast) must be above 4.5.
    `;

    const response = await cohere.chat({
      model: "command-r-08-2024",
      message: systemPrompt,
      maxTokens: 500,
      temperature: 0.3,
      responseFormat: { type: "json_object" }
    });

    const parsed = JSON.parse(response.text);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Theme Synthesis Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
