import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { decideApplication } from "@/lib/api/staffAdmissions";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const { decision, decision_reason } = await request.json();
  const { status, body } = await decideApplication(token, Number(id), decision, decision_reason);
  return NextResponse.json(body, { status });
}
