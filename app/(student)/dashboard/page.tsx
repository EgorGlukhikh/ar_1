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
  Clock,
  GraduationCap,
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
    prisma.user.findUnique({ where: { id: userId }, select: { telegramId: true } }),
  ]);

  return { enrollments, certificates, unreadMessages, maxConnected: !!user?.telegramId };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { enrollments, certificates, unreadMessages, maxConnected } =
    await getStudentData(session.user.id);

  return (
    <div>
      {!maxConnected && <MaxBotBanner />}

      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Привет, {session.user.name?.split(" ")[0] ?? "студент"} 👋
        </h1>
        <p className="text-muted-foreground">Ваш личный кабинет</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
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
        <Card>
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
        <Card>
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
                <div
                  key={enrollment.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">
                      {enrollment.course.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.course.author.name}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress
                        value={enrollment.progress}
                        className="h-1.5 flex-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {enrollment.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {enrollment.completedAt ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Завершён
                      </Badge>
                    ) : (
                      <Link
                        href={`/courses/${enrollment.course.slug}/learn`}
                      >
                        <Button size="sm">Продолжить</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
