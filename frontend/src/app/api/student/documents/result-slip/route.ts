import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { generateResultSlip } from "@/lib/api/documents";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { academic_session_id, semester_id } = await request.json();
  const { status, body } = await generateResultSlip(
    token,
    Number(academic_session_id),
    semester_id ? Number(semester_id) : undefined
  );
  return NextResponse.json(body, { status });
}
