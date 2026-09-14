import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { generateAdmissionLetter } from "@/lib/api/documents";

export async function POST() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { status, body } = await generateAdmissionLetter(token);
  return NextResponse.json(body, { status });
}
