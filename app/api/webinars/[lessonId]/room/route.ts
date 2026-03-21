import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createVideoSdkRoom } from "@/lib/videosdk";

/** POST — create VideoSDK room for this webinar lesson (author/admin only) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });
  if (session.user.role !== "AUTHOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 });
  }

  const { lessonId } = await params;
  const body = await req.json();
  const { scheduledAt } = body;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { webinar: true },
  });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Create VideoSDK room
  const { roomId } = await createVideoSdkRoom();

  // Upsert webinar record
  const webinar = await prisma.webinar.upsert({
    where: { lessonId },
    create: { lessonId, roomId, scheduledAt: new Date(scheduledAt), status: "SCHEDULED" },
    update: { roomId, scheduledAt: new Date(scheduledAt), status: "SCHEDULED" },
  });

  return NextResponse.json(webinar);
}

/** GET — get webinar info for this lesson */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { lessonId } = await params;
  const webinar = await prisma.webinar.findUnique({ where: { lessonId } });
  return NextResponse.json(webinar);
}
