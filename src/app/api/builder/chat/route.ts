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

    const simplifiedNodes = context.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      heading: node.heading
    }));

    const systemPrompt = `ARIA - NEURAL DESIGN CO-PILOT.
CONTEXT: ${JSON.stringify(simplifiedNodes)}
USER: "${message}"

OUTPUT: VALID JSON ONLY.
SCHEMA: { "mutations": [{ "action": "add"|"update"|"delete", "id": "str", "node": {}, "updates": {} }] }
TYPES: hero, features, pricing, service, testimonial, lead-magnet, cta.
- "add": generate full node object with high-impact copy.
- "update": apply logic to existing nodes.
- Professional/premium vocabulary.`;

    const response = await cohere.chat({
      model: "command-r7b-12-2024", // Fastest high-quality model
      message: systemPrompt,
      maxTokens: 600,
      temperature: 0.3,
      responseFormat: { type: "json_object" }
    });

    const parsed = JSON.parse(response.text);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Aria Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
