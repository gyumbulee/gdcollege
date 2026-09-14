import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { refundPayment } from "@/lib/api/finance";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { amount, reason } = await request.json();
  const { status, body } = await refundPayment(token, Number(id), Number(amount), reason ?? "");
  return NextResponse.json(body, { status });
}
