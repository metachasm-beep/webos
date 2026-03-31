import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { nodes } = await req.json();
    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json({ error: "Missing node sequence." }, { status: 400 });
    }

    // --- HEURISTICS ENGINE ---
    
    // 1. Accessibility (A11y) Heuristics
    const hasH1 = nodes.some(n => 
      (n.type?.toLowerCase().includes("hero") && n.heading) || 
      (n.heading && n.type?.toLowerCase() === "h1")
    );
    const imagesWithoutAlt = nodes.filter(n => n.image && !n.alt).length;
    const a11yScore = Math.max(0, 100 - (hasH1 ? 0 : 30) - (imagesWithoutAlt * 10));

    // 2. SEO & Structure Heuristics
    const nodeTypes = nodes.map(n => n.type?.toLowerCase() || "");
    const hasHero = nodeTypes.some(t => t.includes("hero"));
    const hasCTA = nodeTypes.some(t => t.includes("cta") || t.includes("magnet"));
    const hasFeatures = nodeTypes.some(t => t.includes("feature"));
    
    let seoScore = 40;
    if (hasHero) seoScore += 20;
    if (hasCTA) seoScore += 20;
    if (hasFeatures) seoScore += 20;

    // 3. Performance Est. Heuristics
    const totalNodes = nodes.length;
    const heavyNodes = nodes.filter(n => n.image || n.type?.toLowerCase().includes("gallery")).length;
    const perfScore = Math.max(0, 100 - (totalNodes * 2) - (heavyNodes * 5));

    // 4. Strategic Insights (Aria Logic)
    const insights = [];
    if (!hasH1) insights.push("Synthesis conflict: Missing primary H1 heading hierarchy.");
    if (imagesWithoutAlt > 0) insights.push(`A11y Alert: ${imagesWithoutAlt} media nodes lack semantic descriptors.`);
    if (!hasCTA) insights.push("Conversion Gap: No call-to-action sequence detected.");
    if (totalNodes < 3) insights.push("Structural Warning: Insufficient content density for high-fidelity ranking.");

    const matrix = {
      seo: { score: seoScore, trend: "up", label: seoScore > 80 ? "Dominant" : "Base" },
      performance: { score: perfScore, trend: "up", label: perfScore > 90 ? "Optimal" : "Standard" },
      a11y: { score: a11yScore, trend: "up", label: a11yScore > 90 ? "Compliant" : "Risk" },
      insights
    };

    return NextResponse.json({
      success: true,
      matrix,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[builder-evaluate] Neural link failure.", error);
    return NextResponse.json({ error: "Evaluation protocol failure." }, { status: 500 });
  }
}
