import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default async function AdminCoursesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const courses = await prisma.course.findMany({
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true } },
      _count: {
        select: { enrollments: true, modules: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const published = courses.filter((c) => c.isPublished).length;
  const totalEnrollments = courses.reduce((s, c) => s + c._count.enrollments, 0);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Все курсы</h1>
        <Link
          href="/author/courses/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          + Новый курс
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-primary">{courses.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Всего курсов</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-green-500">{published}</p>
          <p className="text-sm text-muted-foreground mt-1">Опубликовано</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-orange-500">{totalEnrollments}</p>
          <p className="text-sm text-muted-foreground mt-1">Записей</p>
        </div>
      </div>

      {/* Courses table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Список курсов</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-muted-foreground text-xs">
                <th className="text-left px-4 py-3 font-medium">Курс</th>
                <th className="text-left px-4 py-3 font-medium">Автор</th>
                <th className="text-left px-4 py-3 font-medium">Категория</th>
                <th className="text-right px-4 py-3 font-medium">Цена</th>
                <th className="text-center px-4 py-3 font-medium">Студентов</th>
                <th className="text-center px-4 py-3 font-medium">Статус</th>
                <th className="text-center px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    Курсов пока нет
                  </td>
                </tr>
              )}
              {courses.map((course) => (
                <tr key={course.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium max-w-[220px] truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course._count.modules} модулей</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{course.author.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{course.author.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {course.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {course.isFree
                      ? <span className="text-green-600 font-medium">Бесплатно</span>
                      : course.price
                      ? `${course.price.toLocaleString("ru-RU")} ₽`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {course._count.enrollments}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {course.isPublished ? (
                      <Badge variant="default" className="text-xs gap-1">
                        <Eye className="h-3 w-3" />
                        Опубликован
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <EyeOff className="h-3 w-3" />
                        Черновик
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/author/courses/${course.id}/edit`}
                      className="text-xs text-primary hover:underline"
                    >
                      Редактировать
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
