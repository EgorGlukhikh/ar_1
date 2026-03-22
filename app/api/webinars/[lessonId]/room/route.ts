import { NextResponse } from "next/server";

// Legacy route — webinars are now top-level courses (type=WEBINAR)
// See /api/webinars/[courseId]/route.ts for the new API
export async function GET() {
  return NextResponse.json({ message: "Use /api/webinars/[courseId]" }, { status: 410 });
}
export async function POST() {
  return NextResponse.json({ message: "Use /api/webinars/[courseId]" }, { status: 410 });
}
