import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { listResultComponents } from "@/lib/api/results";

export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { status, body } = await listResultComponents(token);
  return NextResponse.json(body, { status });
}
