import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { getDocumentTemplates } from "@/lib/api/admin";

export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { status, body } = await getDocumentTemplates(token);
  return NextResponse.json(body, { status });
}
