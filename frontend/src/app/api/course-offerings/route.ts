import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { listEligibleOfferings } from "@/lib/api/registration";

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const { status, body } = await listEligibleOfferings(token, {
    programme_id: params.programme_id ? Number(params.programme_id) : undefined,
    academic_session_id: params.academic_session_id ? Number(params.academic_session_id) : undefined,
    semester_id: params.semester_id ? Number(params.semester_id) : undefined,
  });
  return NextResponse.json(body, { status });
}
