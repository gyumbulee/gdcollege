import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { decideClearanceItem } from "@/lib/api/clearance";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { decision, remark } = await request.json();
  const { status, body } = await decideClearanceItem(token, Number(id), decision, remark);
  return NextResponse.json(body, { status });
}
