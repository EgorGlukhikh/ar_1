import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      quiz: { include: { questions: { include: { options: true } } } },
      assignment: true,
      attachments: true,
    },
  });
  if (!lesson) return NextResponse.json({}, { status: 404 });
  return NextResponse.json(lesson);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  const lesson = await prisma.lesson.update({ where: { id }, data });
  return NextResponse.json(lesson);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
