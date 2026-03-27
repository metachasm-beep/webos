import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { transactionId } = await req.json();

    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    const apiUrl = process.env.PHONEPE_API_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";

    if (!merchantId || !saltKey) {
      return NextResponse.json({ 
        success: false, 
        error: "Payment gateway not configured." 
      }, { status: 500 });
    }

    const statusEndpoint = `/pg/v1/status/${merchantId}/${transactionId}`;
    const xVerify = crypto
      .createHash("sha256")
      .update(statusEndpoint + saltKey)
      .digest("hex") + "###" + saltIndex;

    const response = await fetch(`${apiUrl}${statusEndpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": merchantId,
      },
    });

    const data = await response.json();

    if (data.code === "PAYMENT_SUCCESS") {
      return NextResponse.json({ 
        success: true, 
        message: "Payment confirmed.",
        transactionId,
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        code: data.code,
        message: data.message || "Payment not completed.",
      });
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Verification failed." 
    }, { status: 500 });
  }
}
