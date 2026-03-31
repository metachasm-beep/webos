import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    // Fetch project
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify ownership
    if (project.user_email !== session.user?.email) {
      return NextResponse.json({ error: "Unauthorized access to sequence" }, { status: 403 });
    }

    const html = generateStandaloneHtml(project);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="webos_synthesis_${id}.html"`,
      },
    });
  } catch (err: any) {
    console.error("Export Protocol Failure.", err.message);
    return NextResponse.json({ error: "Matrix Synthesis Interrupted" }, { status: 500 });
  }
}

function generateStandaloneHtml(project: any) {
  const { nodes, theme, name } = project;
  
  // Replicate Global Theme Variables
  const themes: any = {
    emerald: { primary: "oklch(0.75 0.15 150)", bg: "#050505" },
    sapphire: { primary: "oklch(0.65 0.2 250)", bg: "#050505" },
    ruby: { primary: "oklch(0.6 0.25 20)", bg: "#050505" },
    obsidian: { primary: "oklch(0.98 0 0)", bg: "#020202" }
  };

  const activeTheme = themes[theme] || themes.sapphire;

  const sectionsHtml = nodes.map((node: any) => {
    const type = node.type?.toLowerCase() || "";
    
    if (type.includes("hero")) {
        return `
        <section class="section hero">
            <div class="content">
                <div class="framework-tag">Section / ${node.copyMetrics?.frameworkApplied || 'PAS'}</div>
                <h1>${node.heading}</h1>
                <p>${node.subheading}</p>
                <div class="cta-container">
                    <a href="#" class="btn-primary">${node.ctaText}</a>
                </div>
            </div>
        </section>`;
    }
    
    if (type.includes("features")) {
        return `
        <section class="section features">
            <h2>${node.heading}</h2>
            <div class="grid">
                <div class="feature-card"><h3>Optimization</h3><p>High-performance scaling.</p></div>
                <div class="feature-card"><h3>Synthesis</h3><p>AI-driven asset generation.</p></div>
                <div class="feature-card"><h3>Matrix</h3><p>Global deployment ready.</p></div>
            </div>
        </section>`;
    }

    if (type.includes("cta")) {
        return `
        <section class="section cta">
            <h2>${node.heading || "Ready to scale?"}</h2>
            <p>${node.subheading || "Deploy high-fidelity assets now."}</p>
            <a href="#" class="btn-primary">${node.ctaText || "Get Started"}</a>
        </section>`;
    }

    return `<section class="section fallback"><p>Component: ${node.type}</p></section>`;
  }).join('\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} | Synthesized with WebOS AI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700&family=Space+Grotesk:ital,wght@1,400;1,700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: ${activeTheme.primary};
            --bg: ${activeTheme.bg};
            --text: #ffffff;
            --muted: rgba(255, 255, 255, 0.6);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            background: var(--bg); 
            color: var(--text); 
            font-family: 'Outfit', sans-serif;
            line-height: 1.6;
            overflow-x: hidden;
        }
        h1, h2, h3 { font-family: 'Space Grotesk', sans-serif; font-style: italic; }
        .section { padding: 80px 20px; max-width: 1200px; margin: 0 auto; }
        .hero { text-align: left; min-height: 80vh; display: flex; align-items: center; }
        .hero h1 { font-size: 5rem; line-height: 0.9; margin-bottom: 2rem; letter-spacing: -0.05em; }
        .hero p { font-size: 1.5rem; color: var(--muted); max-width: 600px; margin-bottom: 3rem; }
        .framework-tag { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.4em; color: var(--primary); margin-bottom: 1rem; }
        .btn-primary { 
            display: inline-block;
            background: var(--primary);
            color: white;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.2em;
            transition: transform 0.3s ease;
        }
        .btn-primary:hover { transform: translateY(-4px); }
        .features { text-align: center; }
        .features h2 { font-size: 3rem; margin-bottom: 4rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .feature-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 40px; border-radius: 30px; text-align: left; }
        .feature-card h3 { margin-bottom: 15px; color: var(--primary); }
        .cta { background: rgba(255,255,255,0.02); text-align: center; border-radius: 40px; padding: 100px 40px; }
        .cta h2 { font-size: 4rem; margin-bottom: 1.5rem; }
        .cta p { margin-bottom: 3rem; font-size: 1.2rem; color: var(--muted); }
        @media (max-width: 768px) {
            .hero h1 { font-size: 3rem; }
            .cta h2 { font-size: 2.5rem; }
        }
    </style>
</head>
<body>
    ${sectionsHtml}
    
    <footer style="padding: 40px; text-align: center; opacity: 0.3; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em;">
        Synthesized via WebOS AI Neural Canvas Layer
    </footer>
</body>
</html>`;
}
