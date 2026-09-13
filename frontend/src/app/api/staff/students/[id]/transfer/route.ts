import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { transferStudentProgramme } from "@/lib/api/students";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { to_programme_id, reason } = await request.json();
  const { status, body } = await transferStudentProgramme(token, Number(id), to_programme_id, reason);
  return NextResponse.json(body, { status });
}
