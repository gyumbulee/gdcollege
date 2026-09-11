import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { deleteDocument } from "@/lib/api/applications";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id, documentId } = await params;
  const { status, body } = await deleteDocument(token, Number(id), Number(documentId));
  return NextResponse.json(body, { status });
}
