import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Users, BookOpen, TrendingUp, Award, CreditCard,
  CheckCircle2, Clock, BarChart3,
} from "lucide-react";

export default async function AuthorAnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "AUTHOR" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const whereAuthor =
    session.user.role === "ADMIN"
      ? {}
      : { authorId: session.user.id };

  const courses = await prisma.course.findMany({
    where: whereAuthor,
    include: {
      enrollments: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
          certificates: true,
        },
      },
      payments: {
        where: { status: "PAID" },
        select: { amount: true },
      },
      modules: {
        include: {
          lessons: {
            select: { id: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Gather all lesson IDs for progress lookup
  const allLessonIds = courses.flatMap((c) =>
    c.modules.flatMap((m) => m.lessons.map((l) => l.id))
  );

  // Get quiz attempts for author's courses
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: {
      quiz: { lesson: { module: { course: whereAuthor } } },
    },
    select: { passed: true, score: true, quizId: true },
  });

  const pendingSubmissions = await prisma.submission.count({
    where: {
      status: "PENDING",
      assignment: { lesson: { module: { course: whereAuthor } } },
    },
  });

  // Summary stats
  const totalStudents = new Set(
    courses.flatMap((c) => c.enrollments.map((e) => e.userId))
  ).size;

  const totalRevenue = courses.reduce(
    (s, c) => s + c.payments.reduce((ps, p) => ps + p.amount, 0),
    0
  );

  const totalCerts = courses.reduce((s, c) => s + c._count.certificates, 0);

  const completedEnrollments = courses.reduce(
    (s, c) => s + c.enrollments.filter((e) => e.completedAt).length,
    0
  );

  const totalEnrollments = courses.reduce(
    (s, c) => s + c._count.enrollments,
    0
  );

  const completionRate =
    totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0;

  const quizPassRate =
    quizAttempts.length > 0
      ? Math.round(
          (quizAttempts.filter((a) => a.passed).length / quizAttempts.length) *
            100
        )
      : null;

  const avgQuizScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((s, a) => s + a.score, 0) / quizAttempts.length
        )
      : null;

  // Per-course stats
  const courseStats = courses.map((course) => {
    const totalLessons = course.modules.reduce(
      (s, m) => s + m.lessons.length,
      0
    );
    const revenue = course.payments.reduce((s, p) => s + p.amount, 0);
    const completed = course.enrollments.filter((e) => e.completedAt).length;
    const avgProgress =
      course.enrollments.length > 0
        ? Math.round(
            course.enrollments.reduce((s, e) => s + e.progress, 0) /
              course.enrollments.length
          )
        : 0;

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      isPublished: course.isPublished,
      students: course._count.enrollments,
      completed,
      completionRate:
        course._count.enrollments > 0
          ? Math.round((completed / course._count.enrollments) * 100)
          : 0,
      avgProgress,
      revenue,
      certificates: course._count.certificates,
      totalLessons,
    };
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Аналитика</h1>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Студентов", value: totalStudents, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Выручка", value: `${totalRevenue.toLocaleString("ru-RU")} ₽`, icon: CreditCard, color: "text-emerald-600 bg-emerald-50" },
          { label: "Завершили курс", value: `${completionRate}%`, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
          { label: "Сертификатов", value: totalCerts, icon: Award, color: "text-yellow-600 bg-yellow-50" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border bg-white p-4">
            <div className={`inline-flex p-2 rounded-lg ${kpi.color} mb-3`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Курсов
          </p>
          <p className="text-xl font-bold">{courses.length}</p>
          <p className="text-xs text-muted-foreground">
            {courses.filter((c) => c.isPublished).length} опубликовано
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Всего записей
          </p>
          <p className="text-xl font-bold">{totalEnrollments}</p>
          <p className="text-xs text-muted-foreground">
            {completedEnrollments} завершено
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground mb-1">Успехи в тестах</p>
          <p className="text-xl font-bold">
            {quizPassRate !== null ? `${quizPassRate}%` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {avgQuizScore !== null ? `Средний балл: ${avgQuizScore}%` : "Нет данных"}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> ДЗ на проверке
          </p>
          <p className="text-xl font-bold text-orange-500">{pendingSubmissions}</p>
          <p className="text-xs text-muted-foreground">Ждут куратора</p>
        </div>
      </div>

      {/* Per-course breakdown */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Статистика по курсам</h2>
        <div className="space-y-4">
          {courseStats.map((c) => (
            <div key={c.id} className="rounded-xl border bg-white p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{c.title}</h3>
                    {!c.isPublished && (
                      <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">
                        Черновик
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {c.totalLessons} уроков
                  </p>
                </div>
                <p className="font-bold text-emerald-600 text-sm shrink-0">
                  {c.revenue > 0 ? `${c.revenue.toLocaleString("ru-RU")} ₽` : "Бесплатно"}
                </p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Средний прогресс студентов</span>
                  <span>{c.avgProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${c.avgProgress}%` }}
                  />
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: "Студентов", value: c.students, icon: Users },
                  { label: "Завершили", value: c.completed, icon: CheckCircle2 },
                  { label: "Конверсия", value: `${c.completionRate}%`, icon: TrendingUp },
                  { label: "Сертификатов", value: c.certificates, icon: Award },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-gray-50 p-2">
                    <stat.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="font-bold text-sm">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Student list */}
              {c.students > 0 && (
                <details>
                  <summary className="text-xs text-primary cursor-pointer hover:underline">
                    Показать студентов ({c.students})
                  </summary>
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                    {courses
                      .find((course) => course.id === c.id)
                      ?.enrollments.map((enr) => (
                        <div
                          key={enr.id}
                          className="flex items-center justify-between text-xs rounded-lg bg-gray-50 px-3 py-2"
                        >
                          <div>
                            <span className="font-medium">{enr.user.name ?? "—"}</span>
                            <span className="text-muted-foreground ml-2">{enr.user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${enr.progress}%` }}
                              />
                            </div>
                            <span className="text-muted-foreground w-8 text-right">
                              {enr.progress}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </details>
              )}
            </div>
          ))}

          {courses.length === 0 && (
            <div className="rounded-xl border bg-gray-50 p-12 text-center text-muted-foreground">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Создайте первый курс, чтобы увидеть аналитику</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
