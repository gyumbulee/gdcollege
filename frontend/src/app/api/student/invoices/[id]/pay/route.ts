import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { initiatePayment } from "@/lib/api/finance";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { gateway } = await request.json().catch(() => ({ gateway: undefined }));
  const { status, body } = await initiatePayment(token, Number(id), gateway);
  return NextResponse.json(body, { status });
}
