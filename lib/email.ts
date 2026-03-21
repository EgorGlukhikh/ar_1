import { Resend } from "resend";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM ?? "Академия Риэлторов <noreply@академияриэлторов.рф>";

export async function sendSubmissionReviewed({
  to,
  studentName,
  courseName,
  lessonTitle,
  status,
  feedback,
  score,
  maxScore,
}: {
  to: string;
  studentName: string;
  courseName: string;
  lessonTitle: string;
  status: "APPROVED" | "REJECTED" | "REVISION";
  feedback?: string | null;
  score?: number | null;
  maxScore: number;
}) {
  const statusText = {
    APPROVED: "✅ Принято",
    REJECTED: "❌ Отклонено",
    REVISION: "🔄 Требует доработки",
  }[status];

  const subject = `${statusText} — домашнее задание по курсу «${courseName}»`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
      <div style="background: linear-gradient(135deg, #6E8AFA, #A8BBFF); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Академия Риэлторов</h1>
      </div>
      <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Привет, <strong>${studentName}</strong>!</p>
        <p>Куратор проверил твоё домашнее задание <strong>«${lessonTitle}»</strong> по курсу <strong>«${courseName}»</strong>.</p>

        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #6E8AFA;">
          <p style="margin: 0 0 8px; font-size: 18px; font-weight: bold;">${statusText}</p>
          ${score !== null && score !== undefined ? `<p style="margin: 4px 0; color: #666;">Оценка: <strong>${score} / ${maxScore}</strong></p>` : ""}
          ${feedback ? `<p style="margin: 12px 0 0; color: #444;">${feedback}</p>` : ""}
        </div>

        ${status === "REVISION" || status === "REJECTED"
          ? `<p>Вернись на платформу, чтобы исправить и отправить работу заново.</p>`
          : `<p>Поздравляем! Продолжай обучение 🎉</p>`
        }

        <div style="margin-top: 32px; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL ?? "https://академияриэлторов.рф"}/dashboard"
             style="background: #6E8AFA; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Перейти к обучению →
          </a>
        </div>
      </div>
      <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 16px;">
        Академия Риэлторов · Союз риэлторов
      </p>
    </div>
  `;

  try {
    await getResend()?.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] Failed to send submission review notification:", err);
  }
}

export async function sendCertificateIssued({
  to,
  studentName,
  courseName,
  certificateId,
}: {
  to: string;
  studentName: string;
  courseName: string;
  certificateId: string;
}) {
  const subject = `🎓 Сертификат — курс «${courseName}» пройден!`;
  const downloadUrl = `${process.env.NEXTAUTH_URL ?? "https://академияриэлторов.рф"}/api/certificates/${certificateId}/pdf`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
      <div style="background: linear-gradient(135deg, #6E8AFA, #A8BBFF); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🎓 Сертификат получен!</h1>
      </div>
      <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Поздравляем, <strong>${studentName}</strong>!</p>
        <p>Вы успешно завершили курс <strong>«${courseName}»</strong> и получили сертификат.</p>

        <div style="margin: 28px 0; text-align: center;">
          <a href="${downloadUrl}"
             style="background: #6E8AFA; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px;">
            Скачать сертификат PDF
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          Сертификат также доступен в вашем профиле на платформе.
        </p>
      </div>
      <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 16px;">
        Академия Риэлторов · Союз риэлторов
      </p>
    </div>
  `;

  try {
    await getResend()?.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] Failed to send certificate notification:", err);
  }
}

export async function sendEnrollmentConfirmation({
  to,
  studentName,
  courseName,
  courseSlug,
}: {
  to: string;
  studentName: string;
  courseName: string;
  courseSlug: string;
}) {
  const subject = `Вы записаны на курс «${courseName}»`;
  const courseUrl = `${process.env.NEXTAUTH_URL ?? "https://академияриэлторов.рф"}/courses/${courseSlug}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
      <div style="background: linear-gradient(135deg, #6E8AFA, #A8BBFF); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Академия Риэлторов</h1>
      </div>
      <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Привет, <strong>${studentName}</strong>!</p>
        <p>Вы успешно записаны на курс <strong>«${courseName}»</strong>. Приступайте к обучению!</p>

        <div style="margin: 28px 0; text-align: center;">
          <a href="${courseUrl}"
             style="background: #6E8AFA; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px;">
            Начать обучение →
          </a>
        </div>
      </div>
      <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 16px;">
        Академия Риэлторов · Союз риэлторов
      </p>
    </div>
  `;

  try {
    await getResend()?.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] Failed to send enrollment confirmation:", err);
  }
}
