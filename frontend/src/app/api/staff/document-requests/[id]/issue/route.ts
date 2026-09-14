import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { issueDocumentRequest } from "@/lib/api/documents";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { status, body } = await issueDocumentRequest(token, Number(id));
  return NextResponse.json(body, { status });
}
