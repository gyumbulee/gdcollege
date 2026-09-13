import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { getMyStudentRecord } from "@/lib/api/students";

export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { status, body } = await getMyStudentRecord(token);
  return NextResponse.json(body, { status });
}
