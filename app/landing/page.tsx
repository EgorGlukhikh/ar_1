import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import {
  ArrowRight,
  BookOpen,
  Award,
  Users,
  CheckCircle,
  Play,
  Star,
  TrendingUp,
  GraduationCap,
  Zap,
  Clock,
  LayoutDashboard,
  Quote,
  Building2,
  Target,
  Shield,
} from "lucide-react";

async function getPublishedCourses() {
  return prisma.course.findMany({
    where: { isPublished: true },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
  });
}

// Заглушки для разделов без реальных данных
const TESTIMONIALS = [
  {
    name: "Анна Соколова",
    city: "Москва",
    result: "Закрыла первую сделку через 2 месяца после курса",
    text: "Раньше боялась возражений клиентов. После курса по переговорам появилась уверенность — и первая сделка на 8 млн не заставила себя ждать.",
    avatar: "АС",
    color: "#7C5CFC",
  },
  {
    name: "Дмитрий Ларин",
    city: "Санкт-Петербург",
    result: "Доход вырос в 2 раза за полгода",
    text: "Блок про ипотеку и финансовые инструменты буквально открыл мне глаза. Теперь я не просто показываю квартиры, а помогаю клиентам структурировать сделки.",
    avatar: "ДЛ",
    color: "#F97316",
  },
  {
    name: "Марина Волкова",
    city: "Екатеринбург",
    result: "Запустила своё агентство через год",
    text: "Курс по маркетингу недвижимости — лучшее вложение в карьеру. Научилась работать с социальными сетями и выстраивать поток входящих заявок.",
    avatar: "МВ",
    color: "#22C55E",
  },
];

const PARTNERS = [
  "ИНКОМ-Недвижимость",
  "МИЭЛЬ",
  "Этажи",
  "Авито Недвижимость",
  "ЦИАН",
  "НДВ Супермаркет",
];

const RESULTS = [
  { value: "80%", label: "выпускников увеличили доход\nв первые 6 месяцев" },
  { value: "2×", label: "средний рост сделок\nпосле обучения" },
  { value: "500+", label: "риэлторов уже прошли\nобучение на платформе" },
  { value: "4.9★", label: "средняя оценка\nкурсов студентами" },
];

export default async function LandingPage() {
  const session = await auth();
  const courses = await getPublishedCourses();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ══════════ HERO ══════════ */}
      <section
        className="relative overflow-hidden px-4 pb-24 pt-16 sm:px-6 lg:px-10"
        style={{ background: "linear-gradient(160deg, #EDE9FF 0%, #F5F0FF 50%, #FFF4ED 100%)" }}
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle, #7C5CFC 0%, transparent 70%)" }} />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Аватары студентов */}
          <div className="mb-8 flex items-center justify-center gap-0">
            {["АС", "ДЛ", "МВ", "ИП", "ТС"].map((initials, i) => (
              <div
                key={initials}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md"
                style={{
                  background: ["#7C5CFC", "#F97316", "#22C55E", "#EC4899", "#3B82F6"][i],
                  marginLeft: i > 0 ? "-8px" : "0",
                  zIndex: 5 - i,
                }}
              >
                {initials}
              </div>
            ))}
            <p className="ml-4 text-sm font-medium text-gray-600">
              <span className="font-bold text-gray-900">500+</span> риэлторов уже учатся
            </p>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
            Найди свою{" "}
            <span style={{ background: "linear-gradient(135deg, #7C5CFC, #F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              точку роста
            </span>
            <br />в профессии риэлтора
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-500 sm:text-xl">
            Видеокурсы, тесты, живые вебинары и домашние задания с проверкой куратором —
            всё для того, чтобы ты стал топ-специалистом рынка недвижимости.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/courses">
              <Button
                size="lg"
                className="h-14 gap-2 rounded-2xl px-8 text-base font-bold text-white shadow-xl"
                style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)", boxShadow: "0 8px 30px rgba(124,92,252,0.4)" }}
              >
                Выбрать курс
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            {session?.user ? (
              <Link href={session.user.role === "ADMIN" ? "/admin" : session.user.role === "AUTHOR" ? "/author/courses" : "/dashboard"}>
                <Button size="lg" variant="outline" className="h-14 gap-2 rounded-2xl border-2 px-8 text-base font-semibold" style={{ borderColor: "#7C5CFC", color: "#7C5CFC" }}>
                  <LayoutDashboard className="h-4 w-4" />
                  Мой кабинет
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg" variant="outline" className="h-14 gap-2 rounded-2xl border-2 px-8 text-base font-semibold" style={{ borderColor: "#7C5CFC", color: "#7C5CFC" }}>
                  <Play className="h-4 w-4 fill-current" />
                  Начать бесплатно
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ STATS BAND ══════════ */}
      <section style={{ background: "#1A1A2E" }} className="py-14">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-white/40">
            Наши результаты в цифрах
          </p>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {RESULTS.map(({ value, label }) => (
              <div key={value} className="text-center">
                <p className="mb-2 text-4xl font-black text-white sm:text-5xl">{value}</p>
                <p className="text-sm leading-snug text-white/50 whitespace-pre-line">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ COURSES ══════════ */}
      {courses.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: "#7C5CFC" }}>Каталог</p>
                <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl md:text-4xl">
                  Более {courses.length > 5 ? "20" : courses.length} программ<br />для карьеры и дохода
                </h2>
              </div>
              <Link href="/courses" className="flex items-center gap-1 font-semibold transition-opacity hover:opacity-70" style={{ color: "#7C5CFC" }}>
                Все курсы <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, i) => {
                const CARD_COLORS = ["#EDE9FF", "#FFF4ED", "#E8F5E9", "#FFF0F6", "#E3F2FD", "#FFF9C4"];
                const CARD_ACCENTS = ["#7C5CFC", "#F97316", "#22C55E", "#EC4899", "#3B82F6", "#F59E0B"];
                return (
                  <Link key={course.id} href={`/courses/${course.slug}`}>
                    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                      {/* Cover */}
                      <div className="relative h-44 overflow-hidden" style={{ background: CARD_COLORS[i % CARD_COLORS.length] }}>
                        {course.coverImage ? (
                          <img src={course.coverImage} alt={course.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen className="h-16 w-16 opacity-20" style={{ color: CARD_ACCENTS[i % CARD_ACCENTS.length] }} />
                          </div>
                        )}
                        <div className="absolute left-3 top-3 rounded-xl px-2.5 py-1 text-xs font-bold text-white" style={{ background: CARD_ACCENTS[i % CARD_ACCENTS.length] }}>
                          {course.isFree || !course.price ? "Бесплатно" : `${course.price.toLocaleString("ru")} ₽`}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <p className="mb-1 text-xs font-medium text-gray-400">{course.author.name}</p>
                        <h3 className="mb-4 flex-1 font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Users className="h-3.5 w-3.5" />
                            {course._count.enrollments} студентов
                          </div>
                          <span className="text-xs font-medium" style={{ color: CARD_ACCENTS[i % CARD_ACCENTS.length] }}>
                            Подробнее →
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

      {/* ══════════ METHODOLOGY ══════════ */}
      <section style={{ background: "#F97316" }} className="py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-white">
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-white/70">Наш подход</p>
              <h2 className="mb-6 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                Обучаем на реальных<br />сделках и кейсах
              </h2>
              <p className="mb-8 text-lg text-white/80 leading-relaxed">
                Никаких абстрактных теорий. Только работающие техники,
                разобранные на конкретных историях из российской практики
                рынка недвижимости.
              </p>
              <div className="space-y-3">
                {[
                  "Разборы реальных переговоров с клиентами",
                  "Практические задания на основе актуальных объектов",
                  "Проверка домашних заданий опытными кураторами",
                  "Живые вебинары с вопросами и обратной связью",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                    <span className="text-white/90">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Target, label: "Практические задания", desc: "Работа с реальными кейсами рынка" },
                { icon: Users, label: "Проверка куратором", desc: "Персональная обратная связь" },
                { icon: Zap, label: "Живые вебинары", desc: "Эфир и запись для повтора" },
                { icon: Award, label: "Сертификат", desc: "Документ о прохождении курса" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="rounded-2xl bg-white/15 p-5 backdrop-blur">
                  <Icon className="mb-3 h-6 w-6 text-white" />
                  <p className="font-bold text-white">{label}</p>
                  <p className="mt-1 text-sm text-white/70">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="py-20" style={{ background: "#F5F4FF" }}>
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: "#7C5CFC" }}>Просто начать</p>
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl md:text-4xl">Три шага до результата</h2>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", title: "Выбери программу", desc: "Изучи содержание курса, посмотри превью уроков. Старт — бесплатно.", icon: BookOpen, color: "#7C5CFC" },
              { step: "02", title: "Учись в своём темпе", desc: "Видео, тесты, ДЗ с проверкой куратором. Доступ с любого устройства.", icon: Zap, color: "#F97316" },
              { step: "03", title: "Получи сертификат", desc: "100% курса → именной PDF-сертификат и уведомление о завершении.", icon: Award, color: "#22C55E" },
            ].map(({ step, title, desc, icon: Icon, color }) => (
              <div key={step} className="relative rounded-3xl bg-white p-8 shadow-sm">
                <p className="absolute right-6 top-5 text-6xl font-black opacity-5" style={{ color }}>{step}</p>
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: `${color}18` }}>
                  <Icon className="h-8 w-8" style={{ color }} />
                </div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color }}>{step}</p>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: "#7C5CFC" }}>Истории успеха</p>
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl md:text-4xl">
              Риэлторы, которые уже<br />изменили свою карьеру
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map(({ name, city, result, text, avatar, color }) => (
              <div key={name} className="flex flex-col gap-4 rounded-3xl border border-gray-100 p-7 shadow-sm">
                <Quote className="h-6 w-6" style={{ color }} />
                <p className="flex-1 text-base leading-relaxed text-gray-700">{text}</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-bold text-green-600">{result}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: color }}>
                      {avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{name}</p>
                      <p className="text-xs text-gray-400">{city}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CERTIFICATE ══════════ */}
      <section style={{ background: "#1A1A2E" }} className="py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">По завершении курса</p>
              <h2 className="mb-6 text-3xl font-extrabold text-white sm:text-4xl">
                Выдаём дипломы<br />и сертификаты
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-white/60">
                Каждый выпускник получает именной PDF-сертификат с подтверждением
                пройденного курса. Документ можно добавить в LinkedIn и резюме.
              </p>
              <div className="space-y-3">
                {[
                  "Генерируется автоматически при 100% прохождении",
                  "Именной — с вашим именем и названием курса",
                  "PDF-формат, готов к печати и публикации",
                  "Уведомление через Telegram-бот",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Shield className="h-4 w-4 shrink-0" style={{ color: "#7C5CFC" }} />
                    <span className="text-sm text-white/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Сертификат — mock */}
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-white/10 p-8" style={{ background: "linear-gradient(135deg, rgba(124,92,252,0.15), rgba(249,115,22,0.1))" }}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}>
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Академия Риэлторов</p>
                    <p className="text-xs text-white/40">academyrealtors.ru</p>
                  </div>
                </div>
                <p className="mb-2 text-xs uppercase tracking-widest text-white/40">Сертификат о прохождении</p>
                <p className="mb-1 text-2xl font-extrabold text-white">Иванова Анна Сергеевна</p>
                <p className="mb-6 text-base text-white/60">успешно прошла курс</p>
                <p className="mb-6 text-xl font-bold" style={{ color: "#7C5CFC" }}>
                  Основы риэлторства:<br />с нуля до первой сделки
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-5">
                  <div>
                    <p className="text-xs text-white/30">Дата выдачи</p>
                    <p className="text-sm font-semibold text-white">22 марта 2026</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "#7C5CFC" }}>
                    <Award className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute inset-0 -z-10 rounded-3xl blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, #7C5CFC, #F97316)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ PARTNERS ══════════ */}
      <section className="border-b border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-gray-400">
            Наши выпускники работают в ведущих агентствах
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {PARTNERS.map((p) => (
              <div key={p} className="flex items-center gap-2 text-gray-300 transition-colors hover:text-gray-600">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-semibold">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FOR AUTHORS ══════════ */}
      <section className="py-20" style={{ background: "#F5F4FF" }}>
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="overflow-hidden rounded-3xl" style={{ background: "linear-gradient(135deg, #7C5CFC 0%, #9B5CF6 50%, #C084FC 100%)" }}>
            <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
              <div className="text-white">
                <p className="mb-3 text-sm font-bold uppercase tracking-widest text-white/60">Для преподавателей</p>
                <h2 className="mb-5 text-3xl font-extrabold lg:text-4xl">
                  Стань автором курса<br />и монетизируй экспертизу
                </h2>
                <p className="mb-8 text-lg text-white/80 leading-relaxed">
                  Создавай курсы, проводи вебинары, назначай кураторов.
                  Твои знания о рынке недвижимости — ценный продукт.
                </p>
                <div className="mb-8 grid grid-cols-2 gap-3">
                  {["Редактор курсов", "Аналитика студентов", "Приём платежей", "Живые вебинары", "Управление ДЗ", "Своё расписание"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-white/90">
                      <CheckCircle className="h-4 w-4 text-green-300 shrink-0" />
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
                  { icon: Users, label: "Студентов", value: "500+" },
                  { icon: BookOpen, label: "Курсов", value: "20+" },
                  { icon: TrendingUp, label: "Рост дохода", value: "2×" },
                  { icon: Clock, label: "Доступ 24/7", value: "✓" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-2xl p-5 text-white backdrop-blur" style={{ background: "rgba(255,255,255,0.12)" }}>
                    <Icon className="mb-2 h-6 w-6 text-white/60" />
                    <p className="text-2xl font-extrabold">{value}</p>
                    <p className="text-sm text-white/60">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold" style={{ background: "#EDE9FF", color: "#7C5CFC" }}>
            <Star className="h-4 w-4 fill-current" />
            Начни прямо сейчас — первый урок бесплатно
          </div>
          <h2 className="mb-5 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Сделай первый шаг<br />к карьере, которую хочешь
          </h2>
          <p className="mb-10 text-lg text-gray-500">
            Присоединяйся к сотням риэлторов, которые уже учатся и зарабатывают больше.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 gap-2 rounded-2xl px-10 text-base font-bold text-white shadow-xl"
                style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)", boxShadow: "0 8px 30px rgba(124,92,252,0.4)" }}
              >
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
      <footer style={{ background: "#1A1A2E" }} className="py-14 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}>
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-base font-bold">Академия Риэлторов</span>
              </div>
              <p className="text-sm text-white/40">Профессиональная платформа обучения для риэлторов России</p>
            </div>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Обучение</p>
              <div className="space-y-2">
                <Link href="/courses" className="block text-sm text-white/50 transition-colors hover:text-white">Все курсы</Link>
                <Link href="/courses" className="block text-sm text-white/50 transition-colors hover:text-white">Основы риэлторства</Link>
                <Link href="/courses" className="block text-sm text-white/50 transition-colors hover:text-white">Переговоры и продажи</Link>
                <Link href="/courses" className="block text-sm text-white/50 transition-colors hover:text-white">Ипотека и финансы</Link>
              </div>
            </div>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Платформа</p>
              <div className="space-y-2">
                <Link href="/register" className="block text-sm text-white/50 transition-colors hover:text-white">Регистрация</Link>
                <Link href="/login" className="block text-sm text-white/50 transition-colors hover:text-white">Войти</Link>
                <Link href="/register" className="block text-sm text-white/50 transition-colors hover:text-white">Стать автором</Link>
              </div>
            </div>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Контакты</p>
              <div className="space-y-2">
                <p className="text-sm text-white/50">info@academyrealtors.ru</p>
                <p className="text-sm text-white/50">Telegram: @academyrealtors</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-sm text-white/30">© {new Date().getFullYear()} Академия Риэлторов. Все права защищены.</p>
            <div className="flex gap-6 text-sm text-white/30">
              <Link href="#" className="transition-colors hover:text-white/60">Политика конфиденциальности</Link>
              <Link href="#" className="transition-colors hover:text-white/60">Оферта</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
