import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { checkApplicationPaymentStatus } from "@/lib/api/applications";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { paymentId } = await params;
  const { status, body } = await checkApplicationPaymentStatus(token, Number(paymentId));
  return NextResponse.json(body, { status });
}
