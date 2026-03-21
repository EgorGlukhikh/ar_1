import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, BookOpen, Users, Eye, EyeOff, Edit } from "lucide-react";

async function getAuthorCourses(authorId: string) {
  return prisma.course.findMany({
    where: { authorId },
    include: {
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export default async function AuthorCoursesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const courses = await getAuthorCourses(session.user.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Мои курсы</h1>
          <p className="text-muted-foreground">{courses.length} курс(ов)</p>
        </div>
        <Link href="/author/courses/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Создать курс
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="mb-4 text-muted-foreground">У вас нет курсов</p>
            <Link href="/author/courses/new">
              <Button>Создать первый курс</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{course.title}</h3>
                    <Badge
                      variant={course.isPublished ? "default" : "secondary"}
                      className="shrink-0 text-xs"
                    >
                      {course.isPublished ? (
                        <><Eye className="mr-1 h-3 w-3" />Опубликован</>
                      ) : (
                        <><EyeOff className="mr-1 h-3 w-3" />Черновик</>
                      )}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {course._count.modules} модулей
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course._count.enrollments} студентов
                    </span>
                    <span>
                      {course.isFree ? "Бесплатно" : course.price ? `${course.price.toLocaleString()} ₽` : "—"}
                    </span>
                  </div>
                </div>
                <Link href={`/author/courses/${course.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Edit className="h-3.5 w-3.5" />
                    Редактировать
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
