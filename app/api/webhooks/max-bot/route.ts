import { NextRequest, NextResponse } from "next/server";

const MAX_BOT_TOKEN = process.env.MAX_BOT_TOKEN;
const MAX_API = "https://botapi.max.ru";

// MAX Bot webhook — receives events when users message the bot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle message_created events
    if (body.update_type === "message_created") {
      const senderId: number | undefined = body.message?.sender?.user_id;
      const text: string = body.message?.body?.text ?? "";

      if (senderId && text.startsWith("/start")) {
        // Reply with their MAX user_id so they can paste it in the platform
        await fetch(
          `${MAX_API}/messages?access_token=${MAX_BOT_TOKEN}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: { user_id: senderId },
              body: {
                text: [
                  "👋 Привет! Это бот Академии Риэлторов.",
                  "",
                  `Ваш MAX ID: ${senderId}`,
                  "",
                  "Скопируйте этот номер и введите его в личном кабинете на платформе — раздел «Дашборд» или «Профиль».",
                  "После этого вы будете получать уведомления о проверке домашних заданий, вебинарах и сертификатах.",
                ].join("\n"),
              },
            }),
          }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 }); // always 200 to avoid retries
  }
}
