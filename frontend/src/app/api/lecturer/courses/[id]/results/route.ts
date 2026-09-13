import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { listLecturerResults, upsertResults } from "@/lib/api/results";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { status, body } = await listLecturerResults(token, Number(id));
  return NextResponse.json(body, { status });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { scores } = await request.json();
  const { status, body } = await upsertResults(token, Number(id), scores ?? []);
  return NextResponse.json(body, { status });
}
