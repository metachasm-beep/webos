import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Access Denied." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('audits') // Requires 'audits' table in Supabase
      .select('*')
      .eq('user_email', session.user.email)
      .order('created_at', { ascending: false });

    if (error) {
      // Graceful fallback for missing table
      if (error.code === 'PGRST116' || error.message.includes('not found')) {
         return NextResponse.json([]); 
      }
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Audit Fetch Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Access Denied." }, { status: 401 });
    }

    const auditData = await req.json();

    // Map properties from "Neural Enriched Result" or direct payload
    const metrics = auditData.metrics || {};
    const composite = metrics.composite || {};
    const vectors = composite.breakdown?.vectors || auditData.vectors || {};

    const { data, error } = await supabase
      .from('audits')
      .insert({
        user_email:           session.user.email,
        url:                  auditData.url,
        composite_score:      composite.total || auditData.composite_score || auditData.score,
        status:               composite.status || auditData.status,
        performance_vector:   vectors.performance || auditData.performance_vector,
        security_vector:      vectors.security || auditData.security_vector,
        compliance_vector:    vectors.compliance || auditData.compliance_vector,
        accessibility_score:  metrics.accessibility || auditData.accessibility_score || auditData.scores?.accessibility,
        seo_score:            metrics.seo || auditData.seo_score || auditData.scores?.seo,
        best_practices_score: metrics.bestPractices || auditData.best_practices_score || auditData.scores?.bestPractices,
        summary:              auditData.summary,
        metrics:              metrics,
        raw_data:             auditData, // Store the WHOLE snapshot
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Audit Persistence Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
