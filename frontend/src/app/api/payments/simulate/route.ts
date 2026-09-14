import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000/api/v1";
// Must match backend config('payments.webhook_secret') — dev/demo only,
// never used for a real gateway (Paystack/Flutterwave/Korapay each sign
// with their own scheme, verified independently — see each *Gateway.php).
const TEST_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET ?? "dev-only-test-webhook-secret";

/**
 * Stands in for what a real gateway would do after a student "pays":
 * call our webhook with a signed payload. Only meaningful when a
 * payment's gateway is 'test' — used for demoing/testing the full
 * webhook → verify → apply pathway without live payment credentials.
 */
export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { reference } = await request.json();
  const body = JSON.stringify({ reference });
  const signature = crypto.createHmac("sha256", TEST_WEBHOOK_SECRET).update(body).digest("hex");

  const response = await fetch(`${API_BASE_URL}/payments/webhook/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Test-Signature": signature },
    body,
  });

  return NextResponse.json(await response.json(), { status: response.status });
}
