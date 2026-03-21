import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    include: { student: true },
  });

  return NextResponse.json(submission);
}
