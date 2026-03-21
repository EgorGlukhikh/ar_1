import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LessonEditor } from "@/components/editor/lesson-editor";

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id: courseId, lessonId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      quiz: { include: { questions: { include: { options: true } } } },
      assignment: true,
      webinar: true,
    },
  });

  if (!lesson) notFound();

  return (
    <LessonEditor
      courseId={courseId}
      lesson={JSON.parse(JSON.stringify(lesson))}
    />
  );
}
