import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; role: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id, role } = await params;
  const { status, body } = await apiFetch(`/admin/users/${id}/roles/${role}`, { method: "DELETE", token });
  return NextResponse.json(body, { status });
}
