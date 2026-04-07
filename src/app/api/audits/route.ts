import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { turso } from "@/lib/turso";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Access Denied." }, { status: 401 });
    }

    const { rows } = await turso.execute({
      sql: "SELECT * FROM audits WHERE user_email = ? ORDER BY created_at DESC",
      args: [session.user.email]
    });

    // Parse JSON strings back into objects
    const data = rows.map((row: any) => ({
      ...row,
      summary: typeof row.summary === 'string' ? JSON.parse(row.summary) : row.summary,
      metrics: typeof row.metrics === 'string' ? JSON.parse(row.metrics) : row.metrics,
      raw_data: typeof row.raw_data === 'string' ? JSON.parse(row.raw_data) : row.raw_data,
    }));
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Audit Fetch Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Access Denied." }, { status: 401 });
    }

    const auditData = await req.json();
    const metrics = auditData.metrics || {};
    const composite = metrics.composite || {};
    const vectors = composite.breakdown?.vectors || auditData.vectors || {};

    const result = await turso.execute({
      sql: `INSERT INTO audits (
        user_email, url, composite_score, status, 
        performance_vector, security_vector, compliance_vector,
        accessibility_score, seo_score, best_practices_score,
        summary, metrics, raw_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        session.user.email,
        auditData.url,
        composite.total || auditData.composite_score || auditData.score,
        composite.status || auditData.status,
        vectors.performance || auditData.performance_vector,
        vectors.security || auditData.security_vector,
        vectors.compliance || auditData.compliance_vector,
        metrics.accessibility || auditData.accessibility_score || auditData.scores?.accessibility,
        metrics.seo || auditData.seo_score || auditData.scores?.seo,
        metrics.bestPractices || auditData.best_practices_score || auditData.scores?.bestPractices,
        JSON.stringify(auditData.summary),
        JSON.stringify(metrics),
        JSON.stringify(auditData),
        new Date().toISOString()
      ]
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid?.toString() });
  } catch (error: any) {
    console.error("====== TURSO PERSISTENCE FAILURE ======");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    if (error.message?.includes('no such table')) {
        console.error("CRITICAL: The 'audits' table does not exist in your Turso database.");
    }
    console.error("=======================================");
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }
}
