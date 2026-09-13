import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { createOrGetDraftRegistration, listMyRegistrations } from "@/lib/api/registration";

export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { status, body } = await listMyRegistrations(token);
  return NextResponse.json(body, { status });
}

export async function POST() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { status, body } = await createOrGetDraftRegistration(token);
  return NextResponse.json(body, { status });
}
