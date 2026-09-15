import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { assessSiwesRecord } from "@/lib/api/siwes";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { score, remark } = await request.json();
  const { status, body } = await assessSiwesRecord(token, Number(id), Number(score), remark);
  return NextResponse.json(body, { status });
}
