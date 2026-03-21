import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** PATCH — update webinar status (LIVE / ENDED) and optionally set recording URL */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });
  if (session.user.role !== "AUTHOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 });
  }

  const { lessonId } = await params;
  const { status, recordingUrl } = await req.json();

  const webinar = await prisma.webinar.update({
    where: { lessonId },
    data: {
      status,
      ...(recordingUrl ? { recordingUrl } : {}),
    },
  });

  return NextResponse.json(webinar);
}
