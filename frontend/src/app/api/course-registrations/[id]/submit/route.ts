import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { submitRegistration } from "@/lib/api/registration";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { status, body } = await submitRegistration(token, Number(id));
  return NextResponse.json(body, { status });
}
