import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id, itemId } = await params;
  const { status, body } = await apiFetch(`/admin/cms/galleries/${id}/items/${itemId}`, { method: "DELETE", token });
  return NextResponse.json(body, { status });
}
