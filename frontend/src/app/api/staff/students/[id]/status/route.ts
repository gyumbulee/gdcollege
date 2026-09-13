import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { updateStudentStatus } from "@/lib/api/students";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { status: newStatus, reason } = await request.json();
  const { status, body } = await updateStudentStatus(token, Number(id), newStatus, reason);
  return NextResponse.json(body, { status });
}
