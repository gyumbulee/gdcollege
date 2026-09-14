import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { processDocumentRequest } from "@/lib/api/documents";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { decision, reason } = await request.json();
  const { status, body } = await processDocumentRequest(token, Number(id), decision, reason);
  return NextResponse.json(body, { status });
}
