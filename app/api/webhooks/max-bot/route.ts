import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_BOT_TOKEN = process.env.MAX_BOT_TOKEN;
const MAX_API = "https://botapi.max.ru";

async function sendMessage(userId: number, text: string) {
  await fetch(`${MAX_API}/messages?access_token=${MAX_BOT_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { user_id: userId },
      body: { text },
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[MAX Bot] event:", JSON.stringify(body).slice(0, 400));

    const type: string = body.update_type;
    const maxUserId: number | undefined =
      body.user?.user_id ?? body.chat_id;

    // bot_started — fires when user clicks deep link or opens bot manually
    if (type === "bot_started" && maxUserId) {
      const payload: string | undefined = body.payload; // платформенный userId

      if (payload) {
        // Deep link: автоматически связываем аккаунт
        const user = await prisma.user.findUnique({ where: { id: payload } });
        if (user) {
          await prisma.user.update({
            where: { id: payload },
            data: { telegramId: String(maxUserId) },
          });
          await sendMessage(
            maxUserId,
            `✅ Готово, ${user.name ?? "студент"}!\n\nВаш аккаунт на платформе Академии Риэлторов подключён.\nТеперь вы будете получать уведомления о домашних заданиях, вебинарах и сертификатах.`
          );
        } else {
          await sendMessage(maxUserId, "❌ Ссылка устарела. Зайдите в личный кабинет и попробуйте снова.");
        }
      } else {
        // Открыл бота напрямую без deep link
        await sendMessage(
          maxUserId,
          `👋 Привет! Это бот Академии Риэлторов.\n\nЧтобы подключить уведомления, зайдите в личный кабинет на платформе и нажмите кнопку «Подключить бота».`
        );
      }
    }

    // message_created — любое сообщение
    if (type === "message_created") {
      const senderId: number | undefined = body.message?.sender?.user_id;
      if (senderId) {
        const linked = await prisma.user.findFirst({
          where: { telegramId: String(senderId) },
        });
        if (!linked) {
          await sendMessage(
            senderId,
            `👋 Привет!\n\nЧтобы подключить уведомления, зайдите в личный кабинет на платформе и нажмите кнопку «Подключить бота».`
          );
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[MAX Bot] error:", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
