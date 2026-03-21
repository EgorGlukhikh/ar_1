import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return NextResponse.json({}, { status: 404 });

  if (course.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 });
  }

  const data = await req.json();
  const updated = await prisma.course.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return NextResponse.json({}, { status: 404 });

  if (course.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 });
  }

  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
