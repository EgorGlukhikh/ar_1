import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import {
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Video,
  CheckCircle,
  ClipboardList,
  MessageSquare,
  Star,
  GraduationCap,
  TrendingUp,
  Play,
} from "lucide-react";

async function getPublishedCourses() {
  return prisma.course.findMany({
    where: { isPublished: true },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      _count: { select: { enrollments: true, modules: true } },
    },
  });
}

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const courses = await getPublishedCourses();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-[#0D0F1C] pb-0 pt-20 text-white">
        {/* Gradient orbs */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, #6E8AFA 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          {/* Pill badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#6E8AFA]" />
            Профессиональная LMS-платформа для риэлторов
          </div>

          <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight lg:text-6xl">
            Обучайте риэлторов.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6E8AFA 0%, #A78BFA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Увеличивайте продажи.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60 leading-relaxed">
            Видеокурсы, тесты, домашние задания, живые вебинары и сертификаты —
            всё в одном месте. Платформа создана специально для рынка
            недвижимости.
          </p>

          <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
            <Link href="/courses">
              <Button
                size="lg"
                className="h-14 rounded-xl bg-[#6E8AFA] px-8 text-base font-semibold hover:bg-[#5a76f0]"
              >
                Смотреть курсы
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-xl border-white/20 bg-white/5 px-8 text-base text-white backdrop-blur hover:bg-white/10"
              >
                Начать бесплатно
              </Button>
            </Link>
          </div>

          {/* Floating stat cards */}
          <div className="relative mx-auto mb-0 flex max-w-3xl flex-wrap justify-center gap-3 pb-12">
            {[
              { icon: Users, value: "500+", label: "Студентов" },
              { icon: BookOpen, value: "20+", label: "Курсов" },
              { icon: Award, value: "300+", label: "Сертификатов" },
              { icon: Star, value: "4.9", label: "Рейтинг" },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur"
              >
                <div className="rounded-lg bg-[#6E8AFA]/20 p-2">
                  <Icon className="h-4 w-4 text-[#6E8AFA]" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-xs text-white/50">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="h-16 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <Badge
              variant="secondary"
              className="bg-[#EEF1FF] text-[#6E8AFA]"
            >
              Возможности платформы
            </Badge>
          </div>
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 lg:text-4xl">
            Всё для профессионального роста
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-gray-500">
            Мы собрали лучшие инструменты обучения в одной платформе — без
            лишних сервисов и подписок.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Video,
                color: "bg-blue-50 text-blue-600",
                title: "Видеоуроки",
                desc: "HD-видео без кнопки скачать. Поддержка Rutube, Яндекс Диска и собственного хранилища.",
              },
              {
                icon: ClipboardList,
                color: "bg-violet-50 text-violet-600",
                title: "Тесты с автопроверкой",
                desc: "Одиночный и множественный выбор, открытые вопросы. Результат сразу после прохождения.",
              },
              {
                icon: CheckCircle,
                color: "bg-green-50 text-green-600",
                title: "Домашние задания",
                desc: "Студент сдаёт файл или текст. Куратор проверяет, пишет комментарий, ставит оценку.",
              },
              {
                icon: Play,
                color: "bg-red-50 text-red-600",
                title: "Живые вебинары",
                desc: "Эфир прямо на платформе. После окончания запись автоматически доступна студентам.",
              },
              {
                icon: Award,
                color: "bg-yellow-50 text-yellow-600",
                title: "Сертификаты PDF",
                desc: "Именной сертификат генерируется автоматически при 100% прохождении курса.",
              },
              {
                icon: MessageSquare,
                color: "bg-pink-50 text-pink-600",
                title: "Чат и уведомления",
                desc: "Переписка студент ↔ куратор внутри платформы. Push-уведомления через MAX Bot.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`mb-4 inline-flex rounded-xl p-3 ${color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-4 text-center">
            <Badge
              variant="secondary"
              className="bg-[#EEF1FF] text-[#6E8AFA]"
            >
              Как это работает
            </Badge>
          </div>
          <h2 className="mb-14 text-center text-3xl font-bold text-gray-900 lg:text-4xl">
            Три шага до результата
          </h2>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Выберите курс",
                desc: "Найдите нужный курс в каталоге, ознакомьтесь с программой и запишитесь — бесплатно или после оплаты.",
              },
              {
                step: "02",
                title: "Учитесь в своём темпе",
                desc: "Смотрите уроки, проходите тесты, сдавайте домашние задания. Куратор всегда рядом.",
              },
              {
                step: "03",
                title: "Получите сертификат",
                desc: "После завершения курса вы получите именной PDF-сертификат и уведомление в MAX.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6E8AFA] text-xl font-bold text-white shadow-lg shadow-[#6E8AFA]/30">
                  {step}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COURSES PREVIEW ─── */}
      {courses.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-4 text-center">
              <Badge
                variant="secondary"
                className="bg-[#EEF1FF] text-[#6E8AFA]"
              >
                Каталог курсов
              </Badge>
            </div>
            <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 lg:text-4xl">
              Популярные курсы
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-gray-500">
              Практические курсы от действующих экспертов рынка недвижимости.
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`}>
                  <div className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                    {/* Cover */}
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[#EEF1FF] to-[#D4DDFF]">
                      <GraduationCap className="h-16 w-16 text-[#6E8AFA]/50" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="mb-1 text-xs text-gray-400">
                        {course.author.name}
                      </p>
                      <h3 className="mb-3 font-semibold text-gray-900 line-clamp-2 group-hover:text-[#6E8AFA] transition-colors">
                        {course.title}
                      </h3>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {course._count.enrollments}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {course._count.modules} модулей
                          </span>
                        </div>
                        <span className="font-semibold text-[#6E8AFA]">
                          {course.isFree || course.price === 0
                            ? "Бесплатно"
                            : `${course.price?.toLocaleString("ru")} ₽`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/courses">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl px-8"
                >
                  Все курсы
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden bg-[#0D0F1C] py-24 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 120%, #6E8AFA44 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm">
            <TrendingUp className="h-4 w-4 text-[#6E8AFA]" />
            Начните расти уже сегодня
          </div>
          <h2 className="mb-4 text-4xl font-bold leading-tight lg:text-5xl">
            Готовы прокачать своих риэлторов?
          </h2>
          <p className="mb-10 text-white/60 text-lg">
            Зарегистрируйтесь бесплатно и получите доступ к первым урокам прямо сейчас.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 rounded-xl bg-[#6E8AFA] px-10 text-base font-semibold hover:bg-[#5a76f0]"
              >
                Зарегистрироваться бесплатно
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-xl border-white/20 bg-white/5 px-10 text-base text-white hover:bg-white/10"
              >
                Смотреть курсы
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-[#6E8AFA]" />
              <span className="font-bold text-gray-900">Академия Риэлторов</span>
            </div>
            <nav className="flex gap-6 text-sm text-gray-400">
              <Link href="/courses" className="hover:text-gray-700 transition-colors">Курсы</Link>
              <Link href="/login" className="hover:text-gray-700 transition-colors">Войти</Link>
              <Link href="/register" className="hover:text-gray-700 transition-colors">Регистрация</Link>
            </nav>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Академия Риэлторов
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
