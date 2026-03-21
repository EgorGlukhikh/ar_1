import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id: courseId } = await params;
  const { title } = await req.json();

  const count = await prisma.module.count({ where: { courseId } });

  const newModule = await prisma.module.create({
    data: { title, order: count + 1, courseId },
  });

  return NextResponse.json(newModule, { status: 201 });
}
