import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Award, Download, BookOpen, Calendar, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      certificates: {
        include: { course: { select: { title: true, slug: true } } },
        orderBy: { issuedAt: "desc" },
      },
      enrollments: {
        include: { course: { select: { title: true, slug: true } } },
        orderBy: { enrolledAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Profile header */}
      <div className="rounded-2xl border bg-white p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
          {user.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name ?? "Пользователь"}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <Badge variant="outline" className="mt-1 text-xs">
            {user.role === "STUDENT" ? "Студент" :
             user.role === "CURATOR" ? "Куратор" :
             user.role === "AUTHOR" ? "Автор" : "Администратор"}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-primary">{user.enrollments.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Курсов записано</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-3xl font-bold text-green-500">{user.certificates.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Сертификатов</p>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center col-span-2 md:col-span-1">
          <p className="text-3xl font-bold text-orange-500">
            {user.enrollments.filter((e) => e.completedAt).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Завершено</p>
        </div>
      </div>

      {/* Certificates */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Мои сертификаты
        </h2>
        {user.certificates.length === 0 ? (
          <div className="rounded-xl border bg-gray-50 p-8 text-center text-muted-foreground">
            <Award className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Сертификатов пока нет</p>
            <p className="text-sm mt-1">Завершите курс на 100%, чтобы получить сертификат</p>
          </div>
        ) : (
          <div className="space-y-3">
            {user.certificates.map((cert) => (
              <div
                key={cert.id}
                className="rounded-xl border bg-white p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{cert.course.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {cert.issuedAt.toLocaleDateString("ru-RU")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {cert.number}
                    </span>
                  </div>
                </div>
                <a
                  href={`/api/certificates/${cert.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  Скачать PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Courses */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Мои курсы
        </h2>
        {user.enrollments.length === 0 ? (
          <div className="rounded-xl border bg-gray-50 p-8 text-center text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Курсов пока нет</p>
            <Link href="/courses" className="text-primary hover:underline text-sm mt-1 block">
              Перейти в каталог →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {user.enrollments.map((enr) => (
              <Link
                key={enr.id}
                href={`/courses/${enr.course.slug}`}
                className="flex items-center justify-between rounded-xl border bg-white p-4 hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-sm">{enr.course.title}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  {enr.completedAt ? (
                    <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                      Завершён
                    </Badge>
                  ) : (
                    <span>{enr.progress}% пройдено</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
