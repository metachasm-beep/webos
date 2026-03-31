import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    const { nodes, evaluation } = context;

    if (!process.env.COHERE_API_KEY) {
      return NextResponse.json({ error: "Aria requires Neural Authorization (COHERE_API_KEY)." }, { status: 401 });
    }

    const simplifiedNodes = context.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      heading: node.heading
    }));

    const systemPrompt = `ARIA - NEURAL DESIGN CO-PILOT.
CONTEXT (NODES): ${JSON.stringify(simplifiedNodes)}
CONTEXT (EVALUATION): ${JSON.stringify(evaluation || {})}
USER: "${message}"

OUTPUT: VALID JSON ONLY.
SCHEMA: { "mutations": [{ "action": "add"|"update"|"delete"|"reorder", "id": "str", "node": {}, "updates": {}, "newOrder": ["id1", "id2"] }] }
TYPES: hero, features, pricing, service, testimonial, lead-magnet, cta.
- "add": Give me a "node" object (from RenderNode schema).
- "update": Give me an "id" and "updates" object.
- "delete": Give me an "id".
- "reorder": Give me a "newOrder" array of ID strings in the optimal sequence.

STRATEGIC FOCUS:
If the current sequence is inefficient (e.g., CTA at the very top with no context), use "reorder" to fix it based on the PAS (Problem-Agitate-Solution) or AIDA frameworks.

NEURAL PULSE PROTOCOL:
If you receive a "Strategic Neural Pulse" message, you are in proactive mode. 
1. Analyze the 'scores' and 'insights' provided in the context.
2. If any score is < 80, identify the specific roadblock.
3. Propose a "Master Plan" (array of mutations) to solve it. 
4. If the site looks optimal, return an empty mutations array.
- STRATEGY: Prioritize fixing the detected A11y and SEO issues in the evaluation context.
- Ensure WCAG2AA compliance (alt text, heading levels, aria labels).
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
