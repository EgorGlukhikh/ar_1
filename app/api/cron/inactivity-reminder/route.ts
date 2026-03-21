import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyStudentInactiveReminder } from "@/lib/max-bot";

// Called daily by Railway cron or external scheduler
// Set CRON_SECRET in env to secure this endpoint
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  // Find enrollments that are incomplete and had no lesson progress in last 3 days
  const staleEnrollments = await prisma.enrollment.findMany({
    where: {
      completedAt: null,
      progress: { gt: 0 }, // started at least one lesson
      user: { telegramId: { not: null } },
    },
    include: {
      user: { select: { id: true, name: true, telegramId: true } },
      course: { select: { title: true, slug: true } },
    },
  });

  // For each, check last lesson progress timestamp
  let notified = 0;
  for (const enrollment of staleEnrollments) {
    const lastProgress = await prisma.lessonProgress.findFirst({
      where: {
        userId: enrollment.userId,
        lesson: { module: { courseId: enrollment.courseId } },
      },
      orderBy: { completedAt: "desc" },
    });

    if (!lastProgress || lastProgress.completedAt < threeDaysAgo) {
      await notifyStudentInactiveReminder({
        maxId: enrollment.user.telegramId!,
        studentName: enrollment.user.name ?? "Студент",
        courseName: enrollment.course.title,
        courseSlug: enrollment.course.slug,
      });
      notified++;
    }
  }

  return NextResponse.json({ ok: true, notified });
}
