import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { amount, transactionId, merchantId, saltKey, saltIndex, auditUrl } = await req.json();

    const returnUrl = auditUrl
      ? `${process.env.NEXTAUTH_URL}/audit?url=${encodeURIComponent(auditUrl)}&payment=success`
      : `${process.env.NEXTAUTH_URL}/payment/callback`;

    const payload = {
      merchantId: merchantId || process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: "MUID" + Date.now(),
      amount: amount * 100, // Amount in paise
      redirectUrl: returnUrl,
      redirectMode: "POST",
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/callback`,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const bufferObj = Buffer.from(JSON.stringify(payload), "utf-8");
    const base64EncodedPayload = bufferObj.toString("base64");
    const xVerify = crypto
      .createHash("sha256")
      .update(base64EncodedPayload + "/pg/v1/pay" + saltKey)
      .digest("hex") + "###" + saltIndex;

    const response = await fetch(`${process.env.PHONEPE_API_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox'}/pg/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      body: JSON.stringify({ request: base64EncodedPayload }),
    });

    const resData = await response.json();
    return NextResponse.json(resData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
