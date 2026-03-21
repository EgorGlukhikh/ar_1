import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ courseId: string }> };

// POST — mark student as attending (joined the webinar)
export async function POST(_req: NextRequest, { params }: Params) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const webinar = await prisma.courseWebinar.findUnique({ where: { courseId } });
  if (!webinar) return NextResponse.json({ message: "Webinar not found" }, { status: 404 });

  // Upsert attendance record
  await prisma.webinarAttendance.upsert({
    where: { webinarId_userId: { webinarId: webinar.id, userId: session.user.id } },
    update: {},
    create: { webinarId: webinar.id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
