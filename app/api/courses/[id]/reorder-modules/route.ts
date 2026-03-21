import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { modules } = await req.json();

  await Promise.all(
    modules.map(({ id, order }: { id: string; order: number }) =>
      prisma.module.update({ where: { id }, data: { order } })
    )
  );

  return NextResponse.json({ success: true });
}
