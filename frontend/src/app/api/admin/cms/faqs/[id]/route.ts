import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const payload = await request.json();
  const { status, body } = await apiFetch(`/admin/cms/faqs/${id}`, { method: "PATCH", token, body: JSON.stringify(payload) });
  return NextResponse.json(body, { status });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { status, body } = await apiFetch(`/admin/cms/faqs/${id}`, { method: "DELETE", token });
  return NextResponse.json(body, { status });
}
