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
  ChevronDown,
} from "lucide-react";
import { EnrollButton } from "@/components/courses/enroll-button";

async function getCourse(slug: string) {
  return prisma.course.findUnique({
    where: { slug, isPublished: true },
    include: {
      author: { select: { id: true, name: true, image: true, bio: true } },
      category: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              isPreview: true,
              duration: true,
            },
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
  VIDEO: <PlayCircle className="h-4 w-4 text-blue-500" />,
  TEXT: <BookOpen className="h-4 w-4 text-gray-400" />,
  QUIZ: <CheckCircle className="h-4 w-4 text-green-500" />,
  ASSIGNMENT: <Award className="h-4 w-4 text-orange-400" />,
  WEBINAR: <PlayCircle className="h-4 w-4 text-purple-500" />,
};

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [course, session] = await Promise.all([getCourse(slug), auth()]);

  if (!course) notFound();

  const enrollment = session?.user?.id
    ? await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId: session.user.id, courseId: course.id },
        },
      })
    : null;

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {course.category && (
                <Badge className="mb-3 bg-blue-600 text-white hover:bg-blue-600">
                  {course.category.name}
                </Badge>
              )}
              <h1 className="mb-4 text-3xl font-bold md:text-4xl">
                {course.title}
              </h1>
              {course.description && (
                <p className="mb-6 text-blue-100">{course.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course._count.enrollments} студентов
                </span>
                {course.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {totalLessons} уроков
                </span>
                <Badge variant="outline" className="border-blue-400 text-blue-200">
                  {levelLabel[course.level]}
                </Badge>
              </div>

              <p className="mt-4 text-sm text-blue-300">
                Автор: {course.author.name}
              </p>
            </div>

            {/* Purchase card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                {course.coverImage && (
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="h-44 w-full rounded-t-lg object-cover"
                  />
                )}
                <CardContent className="p-5">
                  <div className="mb-4 text-center">
                    {course.isFree ? (
                      <span className="text-3xl font-bold text-green-600">
                        Бесплатно
                      </span>
                    ) : course.price ? (
                      <span className="text-3xl font-bold">
                        {course.price.toLocaleString()} ₽
                      </span>
                    ) : (
                      <span className="text-xl font-semibold text-muted-foreground">
                        Цена по запросу
                      </span>
                    )}
                  </div>

                  {enrollment ? (
                    <Link href={`/courses/${slug}/learn`}>
                      <Button className="w-full" size="lg">
                        Продолжить обучение
                      </Button>
                    </Link>
                  ) : (
                    <EnrollButton courseId={course.id} slug={slug} isFree={course.isFree} price={course.price} />
                  )}

                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {totalLessons} уроков
                    </li>
                    {course.duration && (
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        {course.duration} материалов
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      Сертификат по окончании
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CURRICULUM */}
      <div className="container mx-auto px-4 py-10">
        <h2 className="mb-6 text-2xl font-bold">Программа курса</h2>
        <div className="space-y-3">
          {course.modules.map((module) => (
            <Card key={module.id}>
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <h3 className="font-semibold">{module.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {module.lessons.length} уроков
                  </span>
                </div>
                <Separator />
                <ul className="divide-y">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        {lessonTypeIcon[lesson.type] ?? (
                          <BookOpen className="h-4 w-4" />
                        )}
                        <span className="text-sm">{lesson.title}</span>
                        {lesson.isPreview && (
                          <Badge
                            variant="outline"
                            className="text-xs text-green-600 border-green-300"
                          >
                            Превью
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {lesson.duration && (
                          <span>{Math.floor(lesson.duration / 60)} мин</span>
                        )}
                        {!lesson.isPreview && !enrollment ? (
                          <Lock className="h-3.5 w-3.5" />
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
