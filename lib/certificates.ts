import { prisma } from "@/lib/prisma";
import { sendCertificateIssued } from "@/lib/email";
import { notifyStudentCertificateIssued } from "@/lib/max-bot";

export async function issueCertificate(userId: string, courseId: string) {
  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) return existing;

  const certNumber = `AR-${Date.now()}-${userId.slice(-4).toUpperCase()}`;
  const [certificate, user, course] = await Promise.all([
    prisma.certificate.create({
      data: { userId, courseId, number: certNumber },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, telegramId: true },
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    }),
  ]);

  if (course && user) {
    await Promise.all([
      user.email
        ? sendCertificateIssued({
            to: user.email,
            studentName: user.name ?? "Студент",
            courseName: course.title,
            certificateId: certificate.id,
          })
        : Promise.resolve(),
      user.telegramId
        ? notifyStudentCertificateIssued({
            maxId: user.telegramId,
            studentName: user.name ?? "Студент",
            courseName: course.title,
          })
        : Promise.resolve(),
    ]);
  }

  return certificate;
}
