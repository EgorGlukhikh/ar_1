import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BlockEditor } from "@/components/editor/block-editor";

export default async function BlockEditorPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string; blockId: string }>;
}) {
  const { id: courseId, lessonId, blockId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const block = await prisma.lessonBlock.findUnique({
    where: { id: blockId },
  });

  if (!block || block.lessonId !== lessonId) notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, title: true },
  });

  if (!lesson) notFound();

  return (
    <BlockEditor
      courseId={courseId}
      lessonId={lessonId}
      lessonTitle={lesson.title}
      block={JSON.parse(JSON.stringify(block))}
    />
  );
}
