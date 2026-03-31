import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PHONEPE_CONFIG, generateChecksum } from "@/lib/phonepe";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication Required" }, { status: 401 });
    }

    const { amount, transactionId } = await req.json();
    if (!amount || !transactionId) {
      return NextResponse.json({ error: "Amount and Transaction ID are mandatory." }, { status: 400 });
    }

    const payload = {
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: session.user.email,
      amount: amount * 100, // INR in Paise
      redirectUrl: `${process.env.NEXTAUTH_URL}/api/phonepe/status?id=${transactionId}`,
      redirectMode: "REDIRECT",
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
    const checksum = generateChecksum(payloadBase64, "/pg/v1/pay");

    const endpoint = `${PHONEPE_CONFIG.BASE_URL}/pg/v1/pay`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      body: JSON.stringify({ request: payloadBase64 }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("PhonePe Initiation Failure.", err.message);
    return NextResponse.json({ error: "Matrix Gateway Timeout" }, { status: 500 });
  }
}
