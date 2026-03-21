import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { issueCertificate } from "@/lib/certificates";

type Params = { params: Promise<{ courseId: string }> };

// POST — end webinar, issue attendance certificates to all attendees
export async function POST(_req: NextRequest, { params }: Params) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      webinar: {
        include: {
          attendances: { include: { user: true } },
        },
      },
    },
  });

  if (!course || !course.webinar) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const canAccess =
    course.authorId === session.user.id || session.user.role === "ADMIN";
  if (!canAccess) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  // Mark webinar as ended
  await prisma.courseWebinar.update({
    where: { courseId },
    data: { status: "ENDED" },
  });

  // Issue certificates to all attendees
  const certificates: string[] = [];
  for (const attendance of course.webinar.attendances) {
    try {
      const cert = await issueCertificate(attendance.userId, courseId);
      certificates.push(cert.id);
    } catch {
      // already has cert — skip
    }
  }

  return NextResponse.json({
    ok: true,
    attendees: course.webinar.attendances.length,
    certificates: certificates.length,
  });
}
