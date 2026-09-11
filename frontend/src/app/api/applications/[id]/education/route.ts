import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { replaceEducationRecords } from "@/lib/api/applications";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { records } = await request.json();
  const { status, body } = await replaceEducationRecords(token, Number(id), records ?? []);
  return NextResponse.json(body, { status });
}
