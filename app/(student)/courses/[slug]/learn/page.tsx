import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function LearnRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" }, take: 1 } },
      },
    },
  });

  if (!course) notFound();

  // Find enrollment or check if admin/author
  const isPrivileged =
    session.user.role === "ADMIN" || session.user.role === "AUTHOR";

  if (!isPrivileged) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    });
    if (!enrollment) redirect(`/courses/${slug}`);
  }

  // Find last completed lesson to resume, else go to first
  const lastProgress = await prisma.lessonProgress.findFirst({
    where: {
      userId: session.user.id,
      lesson: { module: { courseId: course.id } },
    },
    orderBy: { completedAt: "desc" },
    include: { lesson: { include: { module: true } } },
  });

  // All lessons in order
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const firstLesson = allLessons[0];

  if (!firstLesson) redirect(`/courses/${slug}`);

  // If there's progress, go to next lesson after last completed
  if (lastProgress) {
    const lastIdx = allLessons.findIndex((l) => l.id === lastProgress.lessonId);
    const nextLesson = allLessons[lastIdx + 1] ?? allLessons[lastIdx] ?? firstLesson;
    redirect(`/courses/${slug}/learn/${nextLesson.id}`);
  }

  redirect(`/courses/${slug}/learn/${firstLesson.id}`);
}
