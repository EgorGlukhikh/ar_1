import { NextResponse } from "next/server";

// Legacy route — webinars are now top-level courses (type=WEBINAR)
export async function PATCH() {
  return NextResponse.json({ message: "Use /api/webinars/[courseId]" }, { status: 410 });
}
