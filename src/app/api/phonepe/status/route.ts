import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { PHONEPE_CONFIG } from "@/lib/phonepe";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchantTransactionId = searchParams.get("id");

  if (!merchantTransactionId) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?synthesis=error`);
  }

  try {
    // Generate Checksum for Status API
    const endpoint = `/pg/v1/status/${PHONEPE_CONFIG.MERCHANT_ID}/${merchantTransactionId}`;
    const string = endpoint + PHONEPE_CONFIG.SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = `${sha256}###${PHONEPE_CONFIG.SALT_INDEX}`;

    const url = `${PHONEPE_CONFIG.BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": PHONEPE_CONFIG.MERCHANT_ID
      }
    });

    const data = await response.json();
    
    // Check for success
    if (data.success && data.data.state === "COMPLETED") {
       const userEmail = data.data.merchantUserId; // Assuming merchantUserId was user email
       
       // Sync Tier to Supabase
       await supabase
         .from("profiles")
         .upsert({ email: userEmail, tier: "pro", updated_at: new Date().toISOString() });

       return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?synthesis=success`);
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?synthesis=failed`);
  } catch (err: any) {
    console.error("PhonePe Status Verification Failure.", err.message);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?synthesis=error`);
  }
}
