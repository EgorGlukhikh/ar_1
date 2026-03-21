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
    return NextResponse.json({ error: "telegramId не сохранён в БД" }, { status: 400 });
  }

  const maxUserId = Number(user.telegramId);
  const text = `🧪 Тест уведомлений\n\nПривет, ${user.name ?? "администратор"}!\n\nMAX Bot работает ✅`;

  // Try user_id
  const r1 = await fetch(`${BASE}/messages?access_token=${BOT_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: { user_id: maxUserId }, body: { text } }),
  });
  const d1 = await r1.json();

  if (!d1.code) return NextResponse.json({ ok: true, method: "user_id", sentTo: maxUserId });

  // Try chat_id (same value — MAX uses same id for DM chats)
  const r2 = await fetch(`${BASE}/messages?access_token=${BOT_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: { chat_id: maxUserId }, body: { text } }),
  });
  const d2 = await r2.json();

  return NextResponse.json({
    debug: { storedId: user.telegramId, maxUserId },
    user_id_result: d1,
    chat_id_result: d2,
  });
}
