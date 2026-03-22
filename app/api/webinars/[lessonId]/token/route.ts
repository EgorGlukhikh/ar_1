import { NextResponse } from "next/server";

// Legacy route — webinars are now top-level courses (type=WEBINAR)
export async function GET() {
  return NextResponse.json({ message: "Use /api/webinars/[courseId]" }, { status: 410 });
}
