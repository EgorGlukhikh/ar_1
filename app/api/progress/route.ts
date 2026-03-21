import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendCertificateIssued } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { lessonId, courseId } = await req.json();

  // Upsert lesson progress
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: {},
    create: { userId: session.user.id, lessonId },
  });

  // Recalculate course progress %
  const [totalLessons, completedLessons] = await Promise.all([
    prisma.lesson.count({
      where: { module: { courseId } },
    }),
    prisma.lessonProgress.count({
      where: {
        userId: session.user.id,
        lesson: { module: { courseId } },
      },
    }),
  ]);

  const progress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  await prisma.enrollment.update({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    data: {
      progress,
      completedAt: progress === 100 ? new Date() : null,
    },
  });

  // Auto-issue certificate when course completed
  if (progress === 100) {
    const existing = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });

    if (!existing) {
      const certNumber = `AR-${Date.now()}-${session.user.id.slice(-4).toUpperCase()}`;
      const [certificate, user, course] = await Promise.all([
        prisma.certificate.create({
          data: {
            userId: session.user.id,
            courseId,
            number: certNumber,
          },
        }),
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, email: true },
        }),
        prisma.course.findUnique({
          where: { id: courseId },
          select: { title: true },
        }),
      ]);

      if (user?.email && course) {
        await sendCertificateIssued({
          to: user.email,
          studentName: user.name ?? "Студент",
          courseName: course.title,
          certificateId: certificate.id,
        });
      }
    }
  }

  return NextResponse.json({ progress });
}
