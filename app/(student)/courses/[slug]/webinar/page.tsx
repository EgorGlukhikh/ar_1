import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WebinarRoomClient } from "@/components/courses/webinar-room-client";

type Props = { params: Promise<{ slug: string }> };

export default async function WebinarPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { slug, isPublished: true, type: "WEBINAR" },
    include: {
      webinar: true,
      author: { select: { name: true } },
    },
  });

  if (!course || !course.webinar) notFound();

  // Check access: enrolled OR admin/author
  const isPrivileged =
    session.user.role === "ADMIN" || session.user.role === "AUTHOR";

  if (!isPrivileged) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    });
    if (!enrollment) redirect(`/courses/${slug}`);
  }

  return (
    <WebinarRoomClient
      courseId={course.id}
      courseTitle={course.title}
      authorName={course.author.name ?? ""}
      webinar={{
        id: course.webinar.id,
        scheduledAt: course.webinar.scheduledAt.toISOString(),
        duration: course.webinar.duration,
        joinUrl: course.webinar.joinUrl,
        recordingUrl: course.webinar.recordingUrl,
        status: course.webinar.status,
      }}
      userId={session.user.id}
      slug={slug}
    />
  );
}
