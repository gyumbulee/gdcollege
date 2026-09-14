import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { requestDocument } from "@/lib/api/documents";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { type, notes } = await request.json();
  const { status, body } = await requestDocument(token, type, notes);
  return NextResponse.json(body, { status });
}
