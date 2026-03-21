import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { lessons } = await req.json();

  await Promise.all(
    lessons.map(({ id, order }: { id: string; order: number }) =>
      prisma.lesson.update({ where: { id }, data: { order } })
    )
  );

  return NextResponse.json({ success: true });
}
