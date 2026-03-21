import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id: assignmentId } = await params;
  const { content, fileUrl } = await req.json();

  if (!content && !fileUrl) {
    return NextResponse.json(
      { error: "Необходимо добавить текст или файл" },
      { status: 400 }
    );
  }

  // Upsert: one submission per student per assignment
  const existing = await prisma.submission.findFirst({
    where: { assignmentId, studentId: session.user.id },
  });

  let submission;
  if (existing) {
    submission = await prisma.submission.update({
      where: { id: existing.id },
      data: { content, fileUrl, status: "PENDING", feedback: null, score: null },
    });
  } else {
    submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: session.user.id,
        content,
        fileUrl,
        status: "PENDING",
      },
    });
  }

  return NextResponse.json(submission);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id: assignmentId } = await params;

  const submission = await prisma.submission.findFirst({
    where: { assignmentId, studentId: session.user.id },
  });

  return NextResponse.json(submission);
}
