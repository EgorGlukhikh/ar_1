import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id: moduleId } = await params;
  const { title, type } = await req.json();

  const count = await prisma.lesson.count({ where: { moduleId } });

  const lesson = await prisma.lesson.create({
    data: { title, type: type ?? "VIDEO", order: count + 1, moduleId },
  });

  return NextResponse.json(lesson, { status: 201 });
}
