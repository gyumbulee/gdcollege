import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { getRegistration, updateRegistrationItems } from "@/lib/api/registration";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { status, body } = await getRegistration(token, Number(id));
  return NextResponse.json(body, { status });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { course_offering_ids } = await request.json();
  const { status, body } = await updateRegistrationItems(token, Number(id), course_offering_ids ?? []);
  return NextResponse.json(body, { status });
}
