import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { blocks } = await req.json() as { blocks: { id: string; order: number }[] };
  await Promise.all(
    blocks.map(({ id, order }) =>
      prisma.lessonBlock.update({ where: { id }, data: { order } })
    )
  );
  return NextResponse.json({ ok: true });
}
