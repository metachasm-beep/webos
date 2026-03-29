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
    [SYSTEM ROLE: EXPERT BUSINESS WEBSITE BUILDER]
    [OBJECTIVE: CREATE HIGH-CONVERSION WEBSITE SECTIONS]
    [STRATEGY: ${framework}]
    [STYLE: ${style}]

    CONTEXT:
    - Target Audience: ${targetAudience}
    - Input Goal: ${prompt}

    COPYWRITING RULES (${framework}):
    ${framework === "PAS" ? "- Headline: Clear Problem statement. Subtext: Why it matters. Button: The Solution." : ""}
    ${framework === "AIDA" ? "- Headline: Catchy title. Subtext: Interesting facts and benefits. Button: Get Started." : ""}
    ${framework === "BAB" ? "- Headline: The 'Before' state. Subtext: The 'After' transformation. Button: The Bridge." : ""}

    CONTENT GUIDELINES:
    - Use clear, professional layman language.
    - Avoid technical jargon, sci-fi metaphors, or overly complex terms.
    - Focus on benefits and emotional connection.

    DESIGN SYSTEM (${style}):
    ${style === "dark-saas" ? "- bg: gray-950, accent: blue-500, font: bold italic" : ""}
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
      }
    }

    STRICT: Response must be raw JSON only. Use premium, high-impact business vocabulary.
    `;

    const response = await cohere.chat({
      model: "command-r-08-2024",
      message: systemPrompt,
      maxTokens: 1000,
      temperature: 0.7,
    });

    const text = response.text;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonStr = text.substring(jsonStart, jsonEnd);
    let parsed = JSON.parse(jsonStr);
    
    // Ensure the type is lowercase and valid or guess it
    if (!parsed.type) parsed.type = "hero";
    parsed.type = parsed.type.toLowerCase();
    
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Builder Error:", error);
    // Return a valid "error" node structure that the UI can handle professionally
    return NextResponse.json({ 
      type: "error",
      heading: "Matrix Synthesis Interrupted",
      subheading: error?.message || "The AI model encountered an unexpected structure during node generation.",
      error: true
    });
  }
}

