import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  PlayCircle,
  Lock,
  GraduationCap,
  Video,
  Calendar,
} from "lucide-react";
import { EnrollButton } from "@/components/courses/enroll-button";
import { WebinarCountdown } from "@/components/courses/webinar-countdown";

async function getCourse(slug: string) {
  return prisma.course.findUnique({
    where: { slug, isPublished: true },
    include: {
      author: { select: { id: true, name: true, image: true, bio: true } },
      category: true,
      webinar: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, type: true, isPreview: true, duration: true },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });
}

const levelLabel: Record<string, string> = {
  BEGINNER: "Начинающий",
  INTERMEDIATE: "Средний",
  ADVANCED: "Продвинутый",
};

const lessonTypeIcon: Record<string, React.ReactNode> = {
  VIDEO: <PlayCircle className="h-4 w-4 text-purple-500" />,
  TEXT: <BookOpen className="h-4 w-4 text-gray-400" />,
  QUIZ: <CheckCircle className="h-4 w-4 text-green-500" />,
  ASSIGNMENT: <Award className="h-4 w-4 text-orange-400" />,
};

const webinarStatusText: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Запланирован", color: "bg-blue-100 text-blue-700" },
  LIVE: { label: "🔴 Идёт прямо сейчас", color: "bg-red-100 text-red-700" },
  ENDED: { label: "Завершён", color: "bg-gray-100 text-gray-600" },
};

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [course, session] = await Promise.all([getCourse(slug), auth()]);

  if (!course) notFound();

  const [enrollment, userRecord] = await Promise.all([
    session?.user?.id
      ? prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
        })
      : Promise.resolve(null),
    session?.user?.id
      ? prisma.user.findUnique({ where: { id: session.user.id }, select: { balance: true } })
      : Promise.resolve(null),
  ]);

  const isWebinar = course.type === "WEBINAR";
  const webinar = course.webinar;

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalModules = course.modules.length;

  return (
    <div className="min-h-screen" style={{ background: "#F5F4FF" }}>
      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #7C5CFC 0%, #9B5CF6 60%, #C084FC 100%)" }}>
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {isWebinar && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                    <Video className="h-3.5 w-3.5" />
                    Вебинар
                  </span>
                )}
                {course.category && (
                  <Badge className="border-white/30 bg-white/20 text-white hover:bg-white/20">
                    {course.category.name}
                  </Badge>
                )}
                {isWebinar && webinar && (
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${webinarStatusText[webinar.status].color}`}>
                    {webinarStatusText[webinar.status].label}
                  </span>
                )}
              </div>

              <h1 className="mb-4 text-3xl font-extrabold text-white md:text-4xl lg:text-5xl leading-tight">
                {course.title}
              </h1>

              {course.description && (
                <p className="mb-6 text-lg text-white/80 leading-relaxed">{course.description}</p>
              )}

              {/* Webinar date info */}
              {isWebinar && webinar && (
                <div className="mb-6 flex flex-wrap items-center gap-4 text-white/90">
                  <span className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-medium backdrop-blur">
                    <Calendar className="h-4 w-4" />
                    {new Date(webinar.scheduledAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-medium backdrop-blur">
                    <Clock className="h-4 w-4" />
                    {new Date(webinar.scheduledAt).toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {webinar.duration ? ` · ${webinar.duration} мин` : ""}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-white/70">
                    <Users className="h-4 w-4" />
                    {course._count.enrollments} записей
                  </span>
                </div>
              )}

              {/* Course meta */}
              {!isWebinar && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {course._count.enrollments} студентов
                  </span>
                  {course.duration && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {totalLessons} уроков · {totalModules} модулей
                  </span>
                  <Badge className="border-white/30 bg-white/15 text-white/90 hover:bg-white/15">
                    {levelLabel[course.level]}
                  </Badge>
                </div>
              )}

              <p className="mt-5 text-sm text-white/60">
                Ведёт: <span className="text-white/90 font-medium">{course.author.name}</span>
              </p>

              {/* Webinar highlights */}
              {isWebinar && (
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { icon: Video, text: "Онлайн эфир" },
                    { icon: Award, text: "Сертификат" },
                    { icon: Users, text: "Живое общение" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur">
                      <Icon className="h-4 w-4 shrink-0 text-white/70" />
                      <span className="text-sm text-white/90">{text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Course highlights */}
              {!isWebinar && (
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: BookOpen, text: `${totalLessons} уроков` },
                    { icon: Award, text: "Сертификат" },
                    { icon: CheckCircle, text: "Тесты" },
                    { icon: GraduationCap, text: "Куратор" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur">
                      <Icon className="h-4 w-4 shrink-0 text-white/70" />
                      <span className="text-sm text-white/90">{text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 overflow-hidden shadow-2xl">
                {course.coverImage ? (
                  <img src={course.coverImage} alt={course.title} className="h-44 w-full object-cover" />
                ) : (
                  <div
                    className="flex h-44 items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #7C5CFC, #C084FC)" }}
                  >
                    {isWebinar ? (
                      <Video className="h-16 w-16 text-white/60" />
                    ) : (
                      <GraduationCap className="h-16 w-16 text-white/60" />
                    )}
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="mb-5 text-center">
                    {course.isFree ? (
                      <span className="text-3xl font-extrabold text-green-600">Бесплатно</span>
                    ) : course.price ? (
                      <span className="text-3xl font-extrabold text-gray-900">
                        {course.price.toLocaleString("ru")} ₽
                      </span>
                    ) : (
                      <span className="text-xl font-semibold text-muted-foreground">Цена по запросу</span>
                    )}
                  </div>

                  {enrollment ? (
                    <Link href={isWebinar ? `/courses/${slug}/webinar` : `/courses/${slug}/learn`}>
                      <Button
                        className="w-full text-white font-semibold"
                        size="lg"
                        style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
                      >
                        {isWebinar
                          ? (webinar?.status === "ENDED" ? "Смотреть запись" : "Перейти к вебинару")
                          : "Продолжить обучение"}
                      </Button>
                    </Link>
                  ) : (
                    <EnrollButton courseId={course.id} slug={slug} isFree={course.isFree} price={course.price} userBalance={userRecord?.balance ?? 0} />
                  )}

                  {/* Webinar specific info */}
                  {isWebinar && webinar && enrollment && webinar.status === "SCHEDULED" && (
                    <WebinarCountdown scheduledAt={webinar.scheduledAt.toISOString()} />
                  )}

                  <ul className="mt-5 space-y-3">
                    {isWebinar && webinar ? (
                      <>
                        <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0 text-purple-400" />
                          {new Date(webinar.scheduledAt).toLocaleDateString("ru-RU", {
                            day: "numeric", month: "long",
                          })}{" "}
                          в{" "}
                          {new Date(webinar.scheduledAt).toLocaleTimeString("ru-RU", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </li>
                        {webinar.duration && (
                          <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0 text-purple-400" />
                            {webinar.duration} минут
                          </li>
                        )}
                        <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <Award className="h-4 w-4 shrink-0 text-yellow-500" />
                          Сертификат участника
                        </li>
                        {webinar.recordingUrl && (
                          <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <Video className="h-4 w-4 shrink-0 text-blue-500" />
                            Запись доступна
                          </li>
                        )}
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                          {totalLessons} уроков · {totalModules} модулей
                        </li>
                        {course.duration && (
                          <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0 text-purple-400" />
                            {course.duration}
                          </li>
                        )}
                        <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <Award className="h-4 w-4 shrink-0 text-yellow-500" />
                          Сертификат по окончании
                        </li>
                        <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <GraduationCap className="h-4 w-4 shrink-0 text-blue-500" />
                          Проверка ДЗ куратором
                        </li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CURRICULUM — only for courses */}
      {!isWebinar && (
        <div className="container mx-auto px-4 py-10">
          <h2 className="mb-2 text-2xl font-extrabold text-gray-900">Программа курса</h2>
          <p className="mb-6 text-sm text-muted-foreground">{totalModules} модулей · {totalLessons} уроков</p>
          <div className="space-y-3">
            {course.modules.map((module, mi) => (
              <Card key={module.id} className="overflow-hidden">
                <div className="flex items-center justify-between bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
                    >
                      {String(mi + 1).padStart(2, "0")}
                    </div>
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {module.lessons.length} {module.lessons.length === 1 ? "урок" : "уроков"}
                  </span>
                </div>
                <Separator />
                <ul className="divide-y bg-white">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {lessonTypeIcon[lesson.type] ?? <BookOpen className="h-4 w-4" />}
                        <span className="text-sm text-gray-800">{lesson.title}</span>
                        {lesson.isPreview && (
                          <Badge variant="outline" className="border-green-300 text-xs text-green-600">
                            Превью
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {lesson.duration && <span>{Math.floor(lesson.duration / 60)} мин</span>}
                        {!lesson.isPreview && !enrollment && (
                          <Lock className="h-3.5 w-3.5 text-gray-300" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* Author block */}
          {course.author.bio && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Об авторе</h2>
              <Card>
                <CardContent className="flex items-start gap-4 p-5">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
                  >
                    {course.author.name?.[0] ?? "А"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{course.author.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{course.author.bio}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Webinar description block */}
      {isWebinar && course.description && (
        <div className="container mx-auto px-4 py-10">
          <h2 className="mb-4 text-2xl font-extrabold text-gray-900">О вебинаре</h2>
          <Card>
            <CardContent className="p-6">
              <p className="leading-relaxed text-gray-700 whitespace-pre-line">{course.description}</p>
            </CardContent>
          </Card>

          {course.author.bio && (
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Ведущий</h2>
              <Card>
                <CardContent className="flex items-start gap-4 p-5">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
                  >
                    {course.author.name?.[0] ?? "А"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{course.author.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{course.author.bio}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
