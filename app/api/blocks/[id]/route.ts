import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH — update block fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const block = await prisma.lessonBlock.update({
    where: { id },
    data,
  });
  return NextResponse.json(block);
}

// DELETE — remove block
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id } = await params;
  await prisma.lessonBlock.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
