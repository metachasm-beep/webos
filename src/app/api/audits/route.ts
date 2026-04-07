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

    const { data, error } = await supabase
      .from('audits')
      .insert({
        user_email: session.user.email,
        url: auditData.url,
        composite_score: auditData.score || auditData.composite_score,
        status: auditData.status,
        performance_vector: auditData.vectors?.performance || auditData.performance_vector,
        security_vector: auditData.vectors?.security || auditData.security_vector,
        compliance_vector: auditData.vectors?.compliance || auditData.compliance_vector,
        accessibility_score: auditData.scores?.accessibility || auditData.accessibility_score,
        seo_score: auditData.scores?.seo || auditData.seo_score,
        best_practices_score: auditData.scores?.bestPractices || auditData.best_practices_score,
        summary: auditData.summary,
        metrics: auditData.metrics,
        raw_data: auditData.raw_data || auditData, // Store comprehensive snapshot
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
