import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { listLecturerCourses } from "@/lib/api/results";

export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { status, body } = await listLecturerCourses(token);
  return NextResponse.json(body, { status });
}
