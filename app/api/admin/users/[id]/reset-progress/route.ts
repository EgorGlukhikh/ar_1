import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 });
  }

  const { id: userId } = await params;

  // Delete all lesson progress
  await prisma.lessonProgress.deleteMany({ where: { userId } });

  // Reset enrollment progress %
  await prisma.enrollment.updateMany({
    where: { userId },
    data: { progress: 0, completedAt: null },
  });

  return NextResponse.json({ success: true });
}
