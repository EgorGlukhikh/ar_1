import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ message: "courseId required" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  // Paid courses require payment confirmation
  if (!course.isFree && course.price) {
    return NextResponse.json(
      { message: "Payment required" },
      { status: 402 }
    );
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });

  if (existing) {
    return NextResponse.json({ message: "Already enrolled" }, { status: 409 });
  }

  await prisma.enrollment.create({
    data: { userId: session.user.id, courseId },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
