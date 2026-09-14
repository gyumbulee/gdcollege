import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { requestClearance } from "@/lib/api/clearance";

export async function POST() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { status, body } = await requestClearance(token);
  return NextResponse.json(body, { status });
}
