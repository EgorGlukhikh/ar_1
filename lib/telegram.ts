const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options: { parse_mode?: "HTML" | "Markdown" } = { parse_mode: "HTML" }
): Promise<void> {
  if (!BOT_TOKEN) return;

  try {
    await fetch(`${BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode ?? "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error("[telegram] Failed to send message:", err);
  }
}

/** Notify all curators about a new homework submission */
export async function notifyCuratorsNewSubmission({
  curatorTelegramIds,
  studentName,
  lessonTitle,
  courseName,
  submissionId,
}: {
  curatorTelegramIds: string[];
  studentName: string;
  lessonTitle: string;
  courseName: string;
  submissionId: string;
}) {
  const appUrl = process.env.NEXTAUTH_URL ?? "https://академияриэлторов.рф";
  const text =
    `📝 <b>Новое домашнее задание</b>\n\n` +
    `👤 Студент: <b>${studentName}</b>\n` +
    `📚 Курс: ${courseName}\n` +
    `📖 Урок: ${lessonTitle}\n\n` +
    `<a href="${appUrl}/curator/submissions">Проверить →</a>`;

  await Promise.all(
    curatorTelegramIds.map((id) => sendTelegramMessage(id, text))
  );
}

/** Notify student about submission review result */
export async function notifyStudentSubmissionReviewed({
  telegramId,
  studentName,
  lessonTitle,
  status,
  score,
  maxScore,
  feedback,
}: {
  telegramId: string;
  studentName: string;
  lessonTitle: string;
  status: "APPROVED" | "REJECTED" | "REVISION";
  score?: number | null;
  maxScore: number;
  feedback?: string | null;
}) {
  const emoji = { APPROVED: "✅", REJECTED: "❌", REVISION: "🔄" }[status];
  const statusText = { APPROVED: "Принято", REJECTED: "Отклонено", REVISION: "Требует доработки" }[status];

  let text =
    `${emoji} <b>${statusText}</b> — домашнее задание\n\n` +
    `Привет, ${studentName}!\n` +
    `Урок: <b>${lessonTitle}</b>\n`;

  if (score !== null && score !== undefined) {
    text += `Оценка: <b>${score}/${maxScore}</b>\n`;
  }
  if (feedback) {
    text += `\n💬 Комментарий куратора:\n${feedback}`;
  }

  await sendTelegramMessage(telegramId, text);
}

/** Notify student about certificate */
export async function notifyStudentCertificateIssued({
  telegramId,
  studentName,
  courseName,
  certificateId,
}: {
  telegramId: string;
  studentName: string;
  courseName: string;
  certificateId: string;
}) {
  const appUrl = process.env.NEXTAUTH_URL ?? "https://академияриэлторов.рф";
  const text =
    `🎓 <b>Сертификат получен!</b>\n\n` +
    `Поздравляем, ${studentName}!\n` +
    `Вы завершили курс <b>${courseName}</b>.\n\n` +
    `<a href="${appUrl}/profile">Скачать сертификат →</a>`;

  await sendTelegramMessage(telegramId, text);
}

/** Notify student about upcoming webinar */
export async function notifyStudentWebinarSoon({
  telegramId,
  studentName,
  courseName,
  lessonTitle,
  scheduledAt,
  joinUrl,
}: {
  telegramId: string;
  studentName: string;
  courseName: string;
  lessonTitle: string;
  scheduledAt: Date;
  joinUrl: string;
}) {
  const dateStr = scheduledAt.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });

  const text =
    `📡 <b>Вебинар скоро начнётся!</b>\n\n` +
    `Привет, ${studentName}!\n` +
    `Курс: ${courseName}\n` +
    `Тема: <b>${lessonTitle}</b>\n` +
    `🕐 ${dateStr} МСК\n\n` +
    `<a href="${joinUrl}">Присоединиться →</a>`;

  await sendTelegramMessage(telegramId, text);
}
