import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  Play,
  Star,
  TrendingUp,
  GraduationCap,
  Zap,
  MessageSquare,
  Clock,
} from "lucide-react";

async function getPublishedCourses() {
  return prisma.course.findMany({
    where: { isPublished: true },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
  });
}

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const courses = await getPublishedCourses();

  return (
    <div className="min-h-screen" style={{ background: "#F5F4FF" }}>
      <Navbar />

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden px-6 pb-0 pt-16 lg:px-10">
        {/* Bg blobs */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #7C5CFC, #C084FC)" }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #F97316, #FCD34D)" }} />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left */}
            <div className="pb-16 pt-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm" style={{ color: "#7C5CFC" }}>
                <span className="flex h-2 w-2 animate-pulse rounded-full" style={{ background: "#7C5CFC" }} />
                🏆 Платформа №1 для риэлторов России
              </div>

              <h1 className="mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-900 lg:text-6xl">
                Прокачай карьеру{" "}
                <span className="relative">
                  <span style={{ background: "linear-gradient(135deg, #7C5CFC 0%, #F97316 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    риэлтора
                  </span>
                </span>
                <br />до нового уровня
              </h1>

              <p className="mb-8 max-w-lg text-lg leading-relaxed text-gray-500">
                Видеокурсы, тесты, живые вебинары и домашние задания с проверкой куратором. Учись в своём темпе — получи сертификат.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/courses">
                  <Button size="lg" className="h-14 gap-2 rounded-2xl px-8 text-base font-semibold text-white shadow-lg" style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)", boxShadow: "0 8px 30px rgba(124,92,252,0.4)" }}>
                    Выбрать курс
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="h-14 gap-2 rounded-2xl border-2 px-8 text-base font-semibold" style={{ borderColor: "#7C5CFC", color: "#7C5CFC" }}>
                    <Play className="h-4 w-4 fill-current" />
                    Начать бесплатно
                  </Button>
                </Link>
              </div>

              {/* Mini stats */}
              <div className="mt-10 flex flex-wrap gap-6">
                {[
                  { value: "500+", label: "Студентов" },
                  { value: "20+", label: "Курсов" },
                  { value: "4.9 ★", label: "Рейтинг" },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                    <p className="text-sm text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — decorative cards */}
            <div className="relative hidden lg:block">
              {/* Main card */}
              <div className="relative ml-8 rounded-3xl p-8 shadow-2xl" style={{ background: "linear-gradient(135deg, #7C5CFC 0%, #9B5CF6 50%, #C084FC 100%)" }}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Академия Риэлторов</p>
                    <p className="text-sm text-white/70">Профессиональное обучение</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["Основы риэлторства", "Работа с возражениями", "Ипотека и финансы", "Маркетинг объектов"].map((item, i) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ background: "rgba(255,255,255,0.2)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <span className="text-sm font-medium text-white">{item}</span>
                      <CheckCircle className="ml-auto h-4 w-4 text-green-300" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -left-4 top-8 rounded-2xl bg-white px-5 py-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#FFF3E0" }}>
                    <Award className="h-5 w-5" style={{ color: "#F97316" }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Сертификат</p>
                    <p className="text-xs text-gray-400">выдаётся автоматически</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-16 rounded-2xl bg-white px-5 py-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#E8F5E9" }}>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Прогресс</p>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full w-3/4 rounded-full bg-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="h-16 w-full" style={{ background: "linear-gradient(to bottom, transparent, #fff)" }} />
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: "#7C5CFC" }}>Почему мы</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Всё для роста в одном месте</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Video, label: "Видеоуроки", desc: "HD-видео без кнопки скачать. Rutube, Яндекс Диск, собственный S3", color: "#EDE9FF", iconColor: "#7C5CFC", num: "01" },
              { icon: CheckCircle, label: "Тесты и ДЗ", desc: "Автопроверка тестов и ручная проверка домашних заданий куратором", color: "#FFF3E0", iconColor: "#F97316", num: "02" },
              { icon: Users, label: "Живые вебинары", desc: "Эфир прямо на платформе. Запись сохраняется автоматически", color: "#E8F5E9", iconColor: "#22C55E", num: "03" },
              { icon: Award, label: "Сертификаты", desc: "PDF-сертификат генерируется при 100% прохождении курса", color: "#FFF0F6", iconColor: "#EC4899", num: "04" },
            ].map(({ icon: Icon, label, desc, color, iconColor, num }) => (
              <div key={label} className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <p className="absolute right-5 top-4 text-5xl font-black opacity-5" style={{ color: iconColor }}>{num}</p>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: color }}>
                  <Icon className="h-7 w-7" style={{ color: iconColor }} />
                </div>
                <h3 className="mb-2 font-bold text-gray-900">{label}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="py-20" style={{ background: "#F5F4FF" }}>
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: "#7C5CFC" }}>Простой старт</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Три шага до результата</h2>
          </div>

          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* Connecting line */}
            <div className="absolute left-1/6 right-1/6 top-10 hidden h-0.5 bg-gradient-to-r from-transparent via-purple-200 to-transparent sm:block" />

            {[
              { step: "1", title: "Выбери курс", desc: "Изучи программу, посмотри превью уроков. Запишись бесплатно или после оплаты.", icon: BookOpen, color: "#7C5CFC" },
              { step: "2", title: "Учись в темпе", desc: "Видео, тесты, домашние задания. Куратор проверяет и даёт обратную связь.", icon: Zap, color: "#F97316" },
              { step: "3", title: "Получи сертификат", desc: "100% курса → именной PDF-сертификат + уведомление в MAX Bot.", icon: Award, color: "#22C55E" },
            ].map(({ step, title, desc, icon: Icon, color }) => (
              <div key={step} className="relative text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, border: `2px solid ${color}33` }}>
                  <Icon className="h-9 w-9" style={{ color }} />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white shadow" style={{ background: color }}>{step}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ COURSES ══════════ */}
      {courses.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: "#7C5CFC" }}>Каталог</p>
                <h2 className="text-4xl font-extrabold text-gray-900">Популярные курсы</h2>
              </div>
              <Link href="/courses" className="flex items-center gap-1 font-medium transition-colors hover:opacity-70" style={{ color: "#7C5CFC" }}>
                Все курсы <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {courses.map((course, i) => {
                const gradients = [
                  "linear-gradient(135deg, #7C5CFC, #C084FC)",
                  "linear-gradient(135deg, #F97316, #FCD34D)",
                  "linear-gradient(135deg, #22C55E, #86EFAC)",
                  "linear-gradient(135deg, #EC4899, #F9A8D4)",
                ];
                return (
                  <Link key={course.id} href={`/courses/${course.slug}`}>
                    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex h-36 items-center justify-center" style={{ background: gradients[i % 4] }}>
                        <GraduationCap className="h-14 w-14 text-white/70" />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <p className="mb-1 text-xs font-medium text-gray-400">{course.author.name}</p>
                        <h3 className="mb-3 flex-1 font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {course.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Users className="h-3.5 w-3.5" />
                            {course._count.enrollments}
                          </div>
                          <span className="rounded-xl px-3 py-1 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}>
                            {course.isFree || !course.price ? "Бесплатно" : `${course.price.toLocaleString("ru")} ₽`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ FOR AUTHORS ══════════ */}
      <section className="py-20" style={{ background: "#F5F4FF" }}>
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="overflow-hidden rounded-3xl" style={{ background: "linear-gradient(135deg, #7C5CFC 0%, #9B5CF6 50%, #F97316 100%)" }}>
            <div className="grid items-center gap-8 p-10 lg:grid-cols-2 lg:p-14">
              <div className="text-white">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Для преподавателей</p>
                <h2 className="mb-4 text-3xl font-extrabold lg:text-4xl">Стань автором курса</h2>
                <p className="mb-6 text-lg text-white/80">
                  Создавай курсы, проводи вебинары, назначай кураторов и зарабатывай на своих знаниях о рынке недвижимости.
                </p>
                <div className="mb-8 grid grid-cols-2 gap-3">
                  {["Редактор курсов", "Аналитика студентов", "Приём платежей", "Живые вебинары"].map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-white/90">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/register">
                  <Button size="lg" className="h-12 rounded-2xl bg-white px-8 font-bold hover:bg-gray-50" style={{ color: "#7C5CFC" }}>
                    Подать заявку
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Users, label: "Студентов", value: "500+", bg: "rgba(255,255,255,0.15)" },
                  { icon: BookOpen, label: "Курсов", value: "20+", bg: "rgba(255,255,255,0.15)" },
                  { icon: MessageSquare, label: "Чат с учениками", value: "✓", bg: "rgba(255,255,255,0.15)" },
                  { icon: Clock, label: "Своё расписание", value: "✓", bg: "rgba(255,255,255,0.15)" },
                ].map(({ icon: Icon, label, value, bg }) => (
                  <div key={label} className="rounded-2xl p-5 text-white backdrop-blur" style={{ background: bg }}>
                    <Icon className="mb-2 h-6 w-6 text-white/70" />
                    <p className="text-xl font-extrabold">{value}</p>
                    <p className="text-sm text-white/70">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold" style={{ background: "#EDE9FF", color: "#7C5CFC" }}>
            <Star className="h-4 w-4 fill-current" />
            Начни прямо сейчас — это бесплатно
          </div>
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900 lg:text-5xl">
            Готов вырасти как{" "}
            <span style={{ background: "linear-gradient(135deg, #7C5CFC, #F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              профессионал?
            </span>
          </h2>
          <p className="mb-10 text-lg text-gray-500">
            Присоединяйся к сотням риэлторов, которые уже учатся и зарабатывают больше.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-14 gap-2 rounded-2xl px-10 text-base font-bold text-white shadow-xl" style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)", boxShadow: "0 8px 30px rgba(124,92,252,0.4)" }}>
                Зарегистрироваться бесплатно
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="h-14 rounded-2xl border-2 px-10 text-base font-bold" style={{ borderColor: "#7C5CFC", color: "#7C5CFC" }}>
                Смотреть курсы
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background: "#1A1A2E" }} className="py-12 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}>
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Академия Риэлторов</span>
            </div>
            <nav className="flex gap-8 text-sm text-white/50">
              <Link href="/courses" className="transition-colors hover:text-white">Курсы</Link>
              <Link href="/login" className="transition-colors hover:text-white">Войти</Link>
              <Link href="/register" className="transition-colors hover:text-white">Регистрация</Link>
            </nav>
            <p className="text-sm text-white/30">© {new Date().getFullYear()} Академия Риэлторов</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
