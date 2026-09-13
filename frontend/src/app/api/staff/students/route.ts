import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { listStudents } from "@/lib/api/students";

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const { status, body } = await listStudents(token, search);
  return NextResponse.json(body, { status });
}
