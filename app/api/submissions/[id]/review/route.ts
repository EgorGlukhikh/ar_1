import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendSubmissionReviewed } from "@/lib/email";
import { notifyStudentSubmissionReviewed } from "@/lib/max-bot";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  if (session.user.role !== "CURATOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 });
  }

  const { id } = await params;
  const { status, feedback, score } = await req.json();

  const submission = await prisma.submission.update({
    where: { id },
    data: {
      status,
      feedback,
      score,
      reviewerId: session.user.id,
    },
    include: {
      student: { select: { name: true, email: true, telegramId: true } },
      assignment: {
        include: {
          lesson: {
            include: {
              module: {
                include: { course: { select: { title: true } } },
              },
            },
          },
        },
      },
    },
  });

  const studentName = submission.student.name ?? "Студент";
  const courseName = submission.assignment.lesson.module.course.title;
  const lessonTitle = submission.assignment.lesson.title;
  const reviewStatus = status as "APPROVED" | "REJECTED" | "REVISION";

  // Email + Telegram notifications in parallel
  await Promise.all([
    submission.student.email
      ? sendSubmissionReviewed({
          to: submission.student.email,
          studentName,
          courseName,
          lessonTitle,
          status: reviewStatus,
          feedback,
          score,
          maxScore: submission.assignment.maxScore,
        })
      : Promise.resolve(),
    submission.student.telegramId
      ? notifyStudentSubmissionReviewed({
          maxId: submission.student.telegramId,
          studentName,
          lessonTitle,
          status: reviewStatus,
          score,
          maxScore: submission.assignment.maxScore,
          feedback,
        })
      : Promise.resolve(),
  ]);

  return NextResponse.json(submission);
}
