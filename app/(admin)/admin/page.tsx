import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CreditCard, TrendingUp, Award, ClipboardList } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getStats() {
  const [
    totalUsers,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    totalCertificates,
    pendingSubmissions,
    recentPayments,
    recentEnrollments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.enrollment.count(),
    prisma.certificate.count(),
    prisma.submission.count({ where: { status: "PENDING" } }),
    prisma.payment.findMany({
      where: { status: "PAID" },
      include: { user: { select: { name: true } }, course: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.enrollment.findMany({
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
      orderBy: { enrolledAt: "desc" },
      take: 5,
    }),
  ]);

  const revenue = await prisma.payment.aggregate({
    where: { status: "PAID" },
    _sum: { amount: true },
  });

  return {
    totalUsers,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    totalCertificates,
    pendingSubmissions,
    recentPayments,
    recentEnrollments,
    revenue: revenue._sum.amount ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Дашборд администратора</h1>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Пользователей", value: stats.totalUsers, icon: Users, color: "text-blue-600 bg-blue-100" },
          { label: "Курсов", value: stats.publishedCourses, icon: BookOpen, color: "text-green-600 bg-green-100" },
          { label: "Записей", value: stats.totalEnrollments, icon: TrendingUp, color: "text-purple-600 bg-purple-100" },
          { label: "Сертификатов", value: stats.totalCertificates, icon: Award, color: "text-yellow-600 bg-yellow-100" },
          { label: "ДЗ на проверке", value: stats.pendingSubmissions, icon: ClipboardList, color: "text-orange-600 bg-orange-100" },
          { label: "Выручка", value: `${stats.revenue.toLocaleString()} ₽`, icon: CreditCard, color: "text-emerald-600 bg-emerald-100" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 pt-5">
              <div className={`rounded-full p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent enrollments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Последние записи</CardTitle>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-xs">
                Все →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentEnrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{e.user.name}</span>
                  <span className="truncate text-muted-foreground max-w-[180px]">
                    {e.course.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Последние платежи</CardTitle>
            <Link href="/admin/payments">
              <Button variant="ghost" size="sm" className="text-xs">
                Все →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет оплаченных курсов</p>
            ) : (
              <div className="space-y-3">
                {stats.recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{p.user.name}</span>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {p.course.title}
                      </p>
                    </div>
                    <span className="font-semibold text-green-600">
                      +{p.amount.toLocaleString()} ₽
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      {stats.pendingSubmissions > 0 && (
        <Card className="mt-6 border-orange-200 bg-orange-50">
          <CardContent className="flex items-center justify-between pt-4">
            <p className="text-sm text-orange-700">
              <strong>{stats.pendingSubmissions}</strong> домашних заданий ждут проверки
            </p>
            <Link href="/curator/submissions">
              <Button size="sm" variant="outline">
                Проверить
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
