import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { rejectRegistration } from "@/lib/api/registration";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { reason } = await request.json();
  const { status, body } = await rejectRegistration(token, Number(id), reason);
  return NextResponse.json(body, { status });
}
