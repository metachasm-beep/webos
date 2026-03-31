import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    if (!process.env.COHERE_API_KEY) {
      return NextResponse.json({ error: "Aria requires Neural Authorization (COHERE_API_KEY)." }, { status: 401 });
    }

    const systemPrompt = `
    [SYSTEM ROLE: ARIA - NEURAL DESIGN CO-PILOT]
    [OBJECTIVE: ORCHESTRATE DESIGN MUTATIONS VIA CONVERSATION]
    
    CURRENT CANVAS STATE (JSON):
    ${JSON.stringify(context.nodes)}

    TASK:
    - User message: "${message}"
    - You must output VALID MUTATION COMMANDS to update the canvas.
    - Each mutation must follow this schema:
      {
        "action": "add" | "update" | "delete",
        "id": "String (for update/delete)",
        "node": "Node Object (for add)",
        "updates": "Partial Node Object (for update)"
      }

    RULES:
    1. If the user wants to add a section, generate a full node object with high-impact copy.
    2. If the user wants to change existing sections (e.g., "make all headers italics"), output "update" actions for those nodes.
    3. Use professional, premium vocabulary.
    4. RESPOND WITH RAW JSON ONLY.

    AVAILABLE NODE TYPES: hero, features, pricing, service, testimonial, lead-magnet, cta.
    `;

    const response = await cohere.chat({
      model: "command-r-08-2024",
      message: systemPrompt,
      maxTokens: 1500,
      temperature: 0.5,
    });

    const text = response.text;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonStr = text.substring(jsonStart, jsonEnd);
    
    // We might have multiple mutations in an array, or a single object.
    // Aria should ideally return { "mutations": [...] }
    let parsed = JSON.parse(jsonStr);
    
    if (!parsed.mutations) {
      // Wrap if it's a single mutation
      parsed = { mutations: [parsed] };
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Aria Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
