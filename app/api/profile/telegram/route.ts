import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** POST — save user's Telegram chat ID for notifications */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { telegramId } = await req.json();

  if (!telegramId || typeof telegramId !== "string") {
    return NextResponse.json({ error: "telegramId required" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { telegramId },
  });

  return NextResponse.json({ ok: true });
}
