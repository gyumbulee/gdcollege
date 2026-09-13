import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { listStaffApplications } from "@/lib/api/staffAdmissions";

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  const { status: httpStatus, body } = await listStaffApplications(token, status);
  return NextResponse.json(body, { status: httpStatus });
}
