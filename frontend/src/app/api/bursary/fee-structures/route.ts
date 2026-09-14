import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { createFeeStructure } from "@/lib/api/finance";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const data = await request.json();
  const { status, body } = await createFeeStructure(token, data);
  return NextResponse.json(body, { status });
}
