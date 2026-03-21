/**
 * MAX Bot API (max.ru — мессенджер от VK)
 * Docs: https://dev.max.ru/docs/
 *
 * Токен получить: создать бота в MAX → Настройки → API-токен
 * Добавить в .env: MAX_BOT_TOKEN=<токен>
 */

const BOT_TOKEN = process.env.MAX_BOT_TOKEN ?? "";
const BASE = "https://botapi.max.ru";

interface MaxRecipient {
  /** user_id пользователя MAX (числовой) */
  user_id: number;
  /** chat_id для чатов (опционально) */
  chat_id?: number;
}

interface MaxMessageBody {
  text: string;
}

async function sendMaxMessage(
  recipient: MaxRecipient,
  body: MaxMessageBody
): Promise<void> {
  if (!BOT_TOKEN) return;

  try {
    await fetch(`${BASE}/messages?access_token=${BOT_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, body }),
    });
  } catch (err) {
    console.error("[max-bot] Failed to send message:", err);
  }
}

// ─── Notification helpers ─────────────────────────────────────────────────────

/** Уведомить куратора о новом домашнем задании */
export async function notifyCuratorsNewSubmission({
  curatorMaxIds,
  studentName,
  lessonTitle,
  courseName,
}: {
  curatorMaxIds: string[];
  studentName: string;
  lessonTitle: string;
  courseName: string;
}) {
  const appUrl = process.env.NEXTAUTH_URL ?? "https://академияриэлторов.рф";
  const text =
    `📝 Новое домашнее задание\n\n` +
    `👤 Студент: ${studentName}\n` +
    `📚 Курс: ${courseName}\n` +
    `📖 Урок: ${lessonTitle}\n\n` +
    `Проверить: ${appUrl}/curator/submissions`;

  await Promise.all(
    curatorMaxIds.map((id) =>
      sendMaxMessage({ user_id: Number(id) }, { text })
    )
  );
}

/** Уведомить студента о результате проверки ДЗ */
export async function notifyStudentSubmissionReviewed({
  maxId,
  studentName,
  lessonTitle,
  status,
  score,
  maxScore,
  feedback,
}: {
  maxId: string;
  studentName: string;
  lessonTitle: string;
  status: "APPROVED" | "REJECTED" | "REVISION";
  score?: number | null;
  maxScore: number;
  feedback?: string | null;
}) {
  const emoji = { APPROVED: "✅", REJECTED: "❌", REVISION: "🔄" }[status];
  const statusText = {
    APPROVED: "Принято",
    REJECTED: "Отклонено",
    REVISION: "Требует доработки",
  }[status];

  let text = `${emoji} ${statusText} — домашнее задание\n\n`;
  text += `Привет, ${studentName}!\n`;
  text += `Урок: ${lessonTitle}\n`;
  if (score !== null && score !== undefined) {
    text += `Оценка: ${score}/${maxScore}\n`;
  }
  if (feedback) {
    text += `\nКомментарий куратора:\n${feedback}`;
  }

  await sendMaxMessage({ user_id: Number(maxId) }, { text });
}

/** Уведомить студента о получении сертификата */
export async function notifyStudentCertificateIssued({
  maxId,
  studentName,
  courseName,
}: {
  maxId: string;
  studentName: string;
  courseName: string;
}) {
  const appUrl = process.env.NEXTAUTH_URL ?? "https://академияриэлторов.рф";
  const text =
    `🎓 Сертификат получен!\n\n` +
    `Поздравляем, ${studentName}!\n` +
    `Вы завершили курс «${courseName}».\n\n` +
    `Скачать: ${appUrl}/profile`;

  await sendMaxMessage({ user_id: Number(maxId) }, { text });
}

/** Напомнить студенту о предстоящем вебинаре */
export async function notifyStudentWebinarSoon({
  maxId,
  studentName,
  courseName,
  lessonTitle,
  scheduledAt,
  joinUrl,
}: {
  maxId: string;
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
    `📡 Вебинар скоро начнётся!\n\n` +
    `Привет, ${studentName}!\n` +
    `Курс: ${courseName}\n` +
    `Тема: ${lessonTitle}\n` +
    `🕐 ${dateStr} МСК\n\n` +
    `Присоединиться: ${joinUrl}`;

  await sendMaxMessage({ user_id: Number(maxId) }, { text });
}
