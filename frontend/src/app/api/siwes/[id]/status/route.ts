import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { updateSiwesStatus } from "@/lib/api/siwes";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { status: newStatus } = await request.json();
  const { status, body } = await updateSiwesStatus(token, Number(id), newStatus);
  return NextResponse.json(body, { status });
}
