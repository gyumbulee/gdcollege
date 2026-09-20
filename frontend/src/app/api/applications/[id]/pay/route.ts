import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { payApplicationFee } from "@/lib/api/applications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  let gateway: string | undefined;
  try {
    const body = await request.json();
    gateway = body?.gateway;
  } catch {
    // no body sent — use the default gateway
  }

  const { status, body } = await payApplicationFee(token, Number(id), gateway);
  return NextResponse.json(body, { status });
}
