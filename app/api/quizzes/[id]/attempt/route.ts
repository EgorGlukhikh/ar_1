import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id: quizId } = await params;
  const { answers } = await req.json();
  // answers: { [questionId]: string[] | string }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });

  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Calculate score
  let earned = 0;
  let total = 0;

  for (const question of quiz.questions) {
    total += question.points;
    const given: string[] = Array.isArray(answers[question.id])
      ? answers[question.id]
      : answers[question.id]
      ? [answers[question.id]]
      : [];

    if (question.type === "TEXT") {
      // Text answers are not auto-graded — count as 0 for now
      continue;
    }

    const correctIds = question.options
      .filter((o) => o.isCorrect)
      .map((o) => o.id);

    const isCorrect =
      correctIds.length === given.length &&
      correctIds.every((cid) => given.includes(cid));

    if (isCorrect) earned += question.points;
  }

  const scorePercent = total > 0 ? Math.round((earned / total) * 100) : 0;
  const passed = scorePercent >= quiz.passingScore;

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      userId: session.user.id,
      score: scorePercent,
      passed,
      answers,
    },
  });

  return NextResponse.json({ attempt, scorePercent, passed, earned, total });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id: quizId } = await params;

  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId, userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  return NextResponse.json(attempts[0] ?? null);
}
