import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { generateInvoice } from "@/lib/api/finance";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { student_id, fee_structure_id, semester_id } = await request.json();
  const { status, body } = await generateInvoice(token, Number(student_id), Number(fee_structure_id), semester_id ? Number(semester_id) : undefined);
  return NextResponse.json(body, { status });
}
