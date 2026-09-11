import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { uploadDocument } from "@/lib/api/applications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const form = await request.formData();
  const documentType = form.get("document_type");
  const file = form.get("file");

  if (typeof documentType !== "string" || !(file instanceof File)) {
    return NextResponse.json({ success: false, message: "A document type and file are required." }, { status: 422 });
  }

  const { status, body } = await uploadDocument(token, Number(id), documentType, file);
  return NextResponse.json(body, { status });
}
