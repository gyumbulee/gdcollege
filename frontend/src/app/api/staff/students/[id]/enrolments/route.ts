import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { enrolStudent } from "@/lib/api/students";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { academic_session_id, level_id } = await request.json();
  const { status, body } = await enrolStudent(token, Number(id), academic_session_id, level_id);
  return NextResponse.json(body, { status });
}
