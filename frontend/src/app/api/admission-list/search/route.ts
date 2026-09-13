import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  const applicationNumber = request.nextUrl.searchParams.get("application_number");
  if (!applicationNumber) {
    return NextResponse.json({ success: false, message: "Enter an application number." }, { status: 422 });
  }

  const { status, body } = await apiFetch(
    `/admission-list/search?application_number=${encodeURIComponent(applicationNumber)}`
  );
  return NextResponse.json(body, { status });
}
