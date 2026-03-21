import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const BOT_TOKEN = process.env.MAX_BOT_TOKEN ?? "";
const BASE = "https://botapi.max.ru";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { telegramId: true, name: true },
  });

  if (!user?.telegramId) {
    return NextResponse.json({
      error: "Ваш аккаунт не подключён к MAX боту. Зайдите в /dashboard и подключите бота.",
    }, { status: 400 });
  }

  const text =
    `🧪 Тест уведомлений\n\n` +
    `Привет, ${user.name ?? "администратор"}!\n\n` +
    `Если вы это видите — MAX Bot настроен корректно. ✅\n\n` +
    `Платформа работает и готова к продаже:\n` +
    `https://ar1-production.up.railway.app`;

  const res = await fetch(`${BASE}/messages?access_token=${BOT_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { user_id: Number(user.telegramId) },
      body: { text },
    }),
  });

  const data = await res.json();

  if (!res.ok || data.code) {
    return NextResponse.json({ error: data.message ?? "Ошибка отправки", raw: data }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sentTo: user.telegramId });
}
