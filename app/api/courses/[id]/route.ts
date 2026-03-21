import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyStudentsNewCourse } from "@/lib/max-bot";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: { webinar: true },
  });
  if (!course) return NextResponse.json({}, { status: 404 });

  if (course.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 });
  }

  return NextResponse.json(course);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return NextResponse.json({}, { status: 404 });

  if (course.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 });
  }

  const data = await req.json();
  const wasPublished = course.isPublished;
  const updated = await prisma.course.update({ where: { id }, data });

  // Notify all users with MAX Bot connected when course is first published
  if (!wasPublished && updated.isPublished) {
    const usersWithMax = await prisma.user.findMany({
      where: { telegramId: { not: null } },
      select: { telegramId: true },
    });
    const maxIds = usersWithMax
      .map((u) => u.telegramId!)
      .filter(Boolean);
    if (maxIds.length > 0) {
      notifyStudentsNewCourse({
        maxIds,
        courseName: updated.title,
        courseSlug: updated.slug,
      }).catch(() => {});
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return NextResponse.json({}, { status: 404 });

  if (course.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 });
  }

  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
