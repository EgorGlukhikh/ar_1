import { NextRequest, NextResponse } from "next/server";

const MAX_BOT_TOKEN = process.env.MAX_BOT_TOKEN;
const MAX_API = "https://botapi.max.ru";

async function sendWelcome(userId: number) {
  const res = await fetch(`${MAX_API}/messages?access_token=${MAX_BOT_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { user_id: userId },
      body: {
        text: [
          "👋 Привет! Это бот Академии Риэлторов.",
          "",
          `🔑 Ваш MAX ID: ${userId}`,
          "",
          "Скопируйте этот номер и введите его в личном кабинете на платформе (раздел Дашборд).",
          "После этого вы будете получать уведомления о проверке домашних заданий, вебинарах и сертификатах.",
        ].join("\n"),
      },
    }),
  });
  console.log("[MAX Bot] sendWelcome →", userId, res.status);
}

// MAX Bot webhook — receives events when users message the bot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[MAX Bot] event:", JSON.stringify(body).slice(0, 300));

    // bot_started — fired when user opens the bot for the first time
    if (body.update_type === "bot_started") {
      const userId: number | undefined = body.user?.user_id ?? body.chat_id;
      if (userId) await sendWelcome(userId);
    }

    // message_created — also handle /start typed manually
    if (body.update_type === "message_created") {
      const senderId: number | undefined = body.message?.sender?.user_id;
      const text: string = body.message?.body?.text ?? "";

      if (senderId && (text.startsWith("/start") || text.trim() === "")) {
        await sendWelcome(senderId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[MAX Bot] error:", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
