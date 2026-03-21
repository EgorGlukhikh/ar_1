import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST — сохранить MAX user_id для уведомлений
 * Body: { maxId: "123456789" }
 *
 * MAX user_id можно узнать через бота: отправь боту команду /start,
 * бот может ответить твоим user_id, или смотри в webhook payload.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { maxId } = await req.json();

  if (!maxId || typeof maxId !== "string") {
    return NextResponse.json({ error: "maxId required" }, { status: 400 });
  }

  // Сохраняем в поле telegramId (универсальное поле для messenger ID)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { telegramId: maxId },
  });

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { telegramId: true },
  });

  return NextResponse.json({ maxId: user?.telegramId ?? null });
}
