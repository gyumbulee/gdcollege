import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { replyToTicket } from "@/lib/api/helpdesk";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { message } = await request.json();
  const { status, body } = await replyToTicket(token, Number(id), message);
  return NextResponse.json(body, { status });
}
