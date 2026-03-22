import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET — list blocks for a lesson
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id: lessonId } = await params;
  const blocks = await prisma.lessonBlock.findMany({
    where: { lessonId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(blocks);
}

// POST — create a new block
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id: lessonId } = await params;
  const { type, title } = await req.json();

  const count = await prisma.lessonBlock.count({ where: { lessonId } });

  const block = await prisma.lessonBlock.create({
    data: {
      lessonId,
      type: type ?? "VIDEO",
      title: title ?? null,
      order: count + 1,
    },
  });

  return NextResponse.json(block, { status: 201 });
}
