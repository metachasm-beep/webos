import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { 
      prompt, 
      style = "dark-saas", 
      framework = "PAS",
      targetAudience = "General Enterprises",
      painPoint = "Low conversion and slow development",
      keyBenefit = "Instant high-performance nodes"
    } = await req.json();

    if (!process.env.COHERE_API_KEY) {
      return NextResponse.json({ 
        error: "AI Builder requires COHERE_API_KEY authorization." 
      });
    }

    const systemPrompt = `
    [SYSTEM PROTOCOL: NEURAL LANDING PAGE ARCHITECT]
    [OBJECTIVE: SYNTHESIZE HIGH-CONVERSION LANDING PAGE NODES]
    [FRAMEWORK: ${framework}]
    [STYLE: ${style}]

    CONTEXT:
    - Target Audience: ${targetAudience}
    - Pain Point: ${painPoint}
    - Key Benefit: ${keyBenefit}
    - Input Description: ${prompt}

    COPYWRITING RULES (${framework}):
    ${framework === "PAS" ? "- Hero H1: Identify the PAIN POINT. Subtext: AGITATE the problem. CTA: The SOLUTION." : ""}
    ${framework === "AIDA" ? "- ATTENTION-grabbing headline, INTEREST-building facts, DESIRE-building proof, ACTION-oriented CTA." : ""}
    ${framework === "BAB" ? "- BEFORE state -> AFTER state. Bridge the gap with our product." : ""}

    DESIGN SYSTEM (${style}):
    ${style === "dark-saas" ? "- bg: gray-950, accent: blue-500, font: bold italic tracking-tighter" : ""}
    ${style === "clean-minimal" ? "- bg: gray-50, accent: black, font: sans-serif medium" : ""}

    OUTPUT SCHEMA (JSON ONLY):
    {
      "type": "hero" | "features" | "pricing" | "cta",
      "heading": "String",
      "subheading": "String",
      "ctaText": "String",
      "visualData": {
        "variant": "glass" | "neon" | "minimal",
        "intensity": 0-100,
        "accentColor": "String (Hex)",
        "layout": "centered" | "split" | "bento"
      },
      "copyMetrics": {
        "frameworkApplied": "${framework}",
        "formality": 0-100
      }
    }

    STRICT: Response must be raw JSON only. Use premium, high-impact vocabulary.
    `;

    const response = await cohere.chat({
      model: "command-r-plus",
      message: systemPrompt,
      maxTokens: 1000,
      temperature: 0.7,
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
