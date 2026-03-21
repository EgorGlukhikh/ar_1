import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  PlayCircle,
  ChevronRight,
  Star,
  TrendingUp,
  Shield,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getFeaturedCourses() {
  return prisma.course.findMany({
    where: { isPublished: true },
    include: {
      author: { select: { name: true, image: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

export default async function HomePage() {
  const courses = await getFeaturedCourses();

  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <Badge className="mb-4 bg-blue-600 text-white hover:bg-blue-600">
            Профессиональное обучение
          </Badge>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl">
            Академия Риэлторов
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100 md:text-xl">
            Освойте профессию риэлтора с нуля или прокачайте существующие
            навыки. Практические курсы от лучших экспертов рынка недвижимости.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/courses">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 gap-2">
                <BookOpen className="h-5 w-5" />
                Смотреть курсы
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 gap-2"
              >
                Начать бесплатно
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: Users, value: "500+", label: "Студентов" },
              { icon: BookOpen, value: "20+", label: "Курсов" },
              { icon: Award, value: "95%", label: "Довольны обучением" },
              { icon: TrendingUp, value: "3x", label: "Рост доходов" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto mb-2 h-8 w-8 text-blue-300" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Почему выбирают нас
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: PlayCircle,
                title: "Видеоуроки от практиков",
                desc: "Все курсы созданы действующими риэлторами и экспертами с многолетним опытом на рынке недвижимости.",
              },
              {
                icon: Shield,
                title: "Проверка знаний",
                desc: "Тесты и домашние задания с обратной связью от куратора помогут закрепить материал.",
              },
              {
                icon: Award,
                title: "Сертификат по окончании",
                desc: "После завершения курса вы получаете именной сертификат, подтверждающий вашу квалификацию.",
              },
            ].map((item) => (
              <Card key={item.title} className="text-center">
                <CardContent className="pt-8">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                    <item.icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      {courses.length > 0 && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">
                Популярные курсы
              </h2>
              <Link href="/courses">
                <Button variant="ghost" className="gap-1">
                  Все курсы <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`}>
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                    {course.coverImage ? (
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <GraduationCap className="h-16 w-16 text-blue-400" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {course.level === "BEGINNER"
                            ? "Начинающий"
                            : course.level === "INTERMEDIATE"
                            ? "Средний"
                            : "Продвинутый"}
                        </Badge>
                        {course.isFree && (
                          <Badge className="bg-green-100 text-green-700 text-xs hover:bg-green-100">
                            Бесплатно
                          </Badge>
                        )}
                      </div>
                      <h3 className="mb-1 line-clamp-2 font-semibold text-gray-900">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {course.author.name}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {course._count.enrollments} студентов
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {course.isFree
                            ? "Бесплатно"
                            : course.price
                            ? `${course.price.toLocaleString()} ₽`
                            : "Цена по запросу"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-blue-900 py-16 text-center text-white">
        <div className="container mx-auto px-4">
          <GraduationCap className="mx-auto mb-4 h-12 w-12 text-blue-300" />
          <h2 className="mb-4 text-3xl font-bold">
            Готовы начать обучение?
          </h2>
          <p className="mb-8 text-blue-200">
            Зарегистрируйтесь сегодня и получите доступ к первым урокам
            бесплатно
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              Начать бесплатно
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
