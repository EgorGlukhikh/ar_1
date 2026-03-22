import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaxBotBanner } from "@/components/onboarding/max-bot-banner";
import {
  BookOpen,
  Award,
  MessageSquare,
  GraduationCap,
  Wallet,
} from "lucide-react";

async function getStudentData(userId: string) {
  const [enrollments, certificates, unreadMessages, user] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            author: { select: { name: true } },
            modules: {
              include: { _count: { select: { lessons: true } } },
            },
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.certificate.count({ where: { userId } }),
    prisma.message.count({ where: { receiverId: userId, isRead: false } }),
    prisma.user.findUnique({ where: { id: userId }, select: { telegramId: true, balance: true } }),
  ]);

  return { enrollments, certificates, unreadMessages, maxConnected: !!user?.telegramId, balance: user?.balance ?? 0 };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { enrollments, certificates, unreadMessages, maxConnected, balance } =
    await getStudentData(session.user.id);

  return (
    <div>
      {!maxConnected && <MaxBotBanner userId={session.user.id} />}

      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Привет, {session.user.name?.split(" ")[0] ?? "студент"} 👋
        </h1>
        <p className="text-muted-foreground">Ваш личный кабинет</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <Link href="/courses">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-full bg-blue-100 p-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrollments.length}</p>
                <p className="text-sm text-muted-foreground">Курсов</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/profile">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-full bg-yellow-100 p-3">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{certificates}</p>
                <p className="text-sm text-muted-foreground">Сертификатов</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/messages">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-full bg-green-100 p-3">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadMessages}</p>
                <p className="text-sm text-muted-foreground">Сообщений</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-emerald-100 p-3">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{balance.toLocaleString("ru")} ₽</p>
              <p className="text-sm text-muted-foreground">Баланс</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Мои курсы</CardTitle>
          <Link href="/courses">
            <Button variant="outline" size="sm">
              Найти курсы
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="py-12 text-center">
              <GraduationCap className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="mb-4 text-muted-foreground">
                Вы ещё не записаны ни на один курс
              </p>
              <Link href="/courses">
                <Button>Выбрать курс</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/courses/${enrollment.course.slug}/learn`}
                  className="flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex items-center gap-3 sm:contents">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-12 sm:w-12">
                      <BookOpen className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{enrollment.course.title}</p>
                      <p className="text-sm text-muted-foreground">{enrollment.course.author.name}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Progress value={enrollment.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{enrollment.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 sm:ml-auto">
                    {enrollment.completedAt ? (
                      <Badge className="bg-green-100 text-green-700">Завершён ✓</Badge>
                    ) : (
                      <Button size="sm" className="w-full sm:w-auto">
                        Продолжить
                      </Button>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
