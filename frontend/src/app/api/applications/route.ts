import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { createApplication, listApplications } from "@/lib/api/applications";

export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { status, body } = await listApplications(token);
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { programme_id } = await request.json().catch(() => ({}));
  const { status, body } = await createApplication(token, programme_id);
  return NextResponse.json(body, { status });
}
