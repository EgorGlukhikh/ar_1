import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateVideoSdkToken } from "@/lib/videosdk";

/** GET — get a JWT token to join the webinar room */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { lessonId } = await params;

  const webinar = await prisma.webinar.findUnique({ where: { lessonId } });
  if (!webinar?.roomId) {
    return NextResponse.json({ error: "Вебинар не настроен" }, { status: 404 });
  }

  const isHost =
    session.user.role === "AUTHOR" || session.user.role === "ADMIN";

  const permissions = isHost
    ? ["allow_join", "allow_mod"]
    : ["allow_join"];

  const token = generateVideoSdkToken(permissions);

  return NextResponse.json({
    token,
    roomId: webinar.roomId,
    isHost,
    status: webinar.status,
    scheduledAt: webinar.scheduledAt,
    recordingUrl: webinar.recordingUrl,
  });
}
