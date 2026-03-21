import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendSubmissionReviewed } from "@/lib/email";

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
      student: { select: { name: true, email: true } },
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

  // Send email notification to student
  if (submission.student.email) {
    await sendSubmissionReviewed({
      to: submission.student.email,
      studentName: submission.student.name ?? "Студент",
      courseName: submission.assignment.lesson.module.course.title,
      lessonTitle: submission.assignment.lesson.title,
      status: status as "APPROVED" | "REJECTED" | "REVISION",
      feedback,
      score,
      maxScore: submission.assignment.maxScore,
    });
  }

  return NextResponse.json(submission);
}
