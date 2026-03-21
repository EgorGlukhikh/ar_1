import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ courseId: string }> };

// GET — get webinar settings
export async function GET(_req: NextRequest, { params }: Params) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { webinar: true },
  });
  if (!course) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const canAccess =
    course.authorId === session.user.id || session.user.role === "ADMIN";
  if (!canAccess) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  return NextResponse.json(course.webinar);
}

// PATCH — create or update webinar settings
export async function PATCH(req: NextRequest, { params }: Params) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const canAccess =
    course.authorId === session.user.id || session.user.role === "ADMIN";
  if (!canAccess) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { scheduledAt, duration, joinUrl, recordingUrl, status } = body;

  const webinar = await prisma.courseWebinar.upsert({
    where: { courseId },
    update: {
      ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
      ...(duration !== undefined && { duration }),
      ...(joinUrl !== undefined && { joinUrl }),
      ...(recordingUrl !== undefined && { recordingUrl }),
      ...(status !== undefined && { status }),
    },
    create: {
      courseId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      duration: duration ?? null,
      joinUrl: joinUrl ?? null,
      recordingUrl: recordingUrl ?? null,
      status: status ?? "SCHEDULED",
    },
  });

  return NextResponse.json(webinar);
}
