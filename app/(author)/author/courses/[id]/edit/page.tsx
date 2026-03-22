import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CourseEditor } from "@/components/editor/course-editor";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { blocks: { orderBy: { order: "asc" } } },
          },
        },
      },
      category: true,
    },
  });

  if (!course) notFound();

  // Only author or admin can edit
  if (course.authorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/author/courses");
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <CourseEditor course={JSON.parse(JSON.stringify(course))} categories={categories} />
  );
}
