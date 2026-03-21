import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BookOpen, Award, Users, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  // Logged-in users go straight to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <span className="text-xl font-bold text-[#6E8AFA]">Академия риэлторов</span>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Войти</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-[#6E8AFA] hover:bg-[#5a76f0]">
              Начать обучение
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative flex flex-col items-center px-6 py-24 text-center sm:py-32"
        style={{
          background:
            "radial-gradient(72.24% 55.65% at 50% 100%, #D4DDFF 0%, #ffffff 100%)",
        }}
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#6E8AFA]/30 bg-white px-4 py-1.5 text-sm text-[#6E8AFA]">
          <span className="h-2 w-2 rounded-full bg-[#6E8AFA]" />
          Профессиональная платформа для риэлторов
        </div>
        <h1 className="mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Обучайтесь, растите,{" "}
          <span className="text-[#6E8AFA]">зарабатывайте больше</span>
        </h1>
        <p className="mb-10 max-w-xl text-lg text-gray-500">
          Видеокурсы, тесты, домашние задания и живые вебинары от практикующих
          экспертов рынка недвижимости.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/courses">
            <Button
              size="lg"
              className="h-14 rounded-xl bg-[#6E8AFA] px-8 text-base hover:bg-[#5a76f0]"
            >
              Смотреть курсы
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-xl px-8 text-base"
            >
              Зарегистрироваться
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-gray-50 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
          {[
            { value: "500+", label: "Студентов" },
            { value: "20+", label: "Курсов" },
            { value: "95%", label: "Довольных учеников" },
            { value: "10 лет", label: "Экспертизы" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-[#6E8AFA]">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
          Всё для профессионального роста
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BookOpen,
              color: "bg-blue-100 text-blue-600",
              title: "Видеоуроки",
              desc: "HD-видео без ограничений по времени. Смотрите в удобном темпе.",
            },
            {
              icon: CheckCircle,
              color: "bg-green-100 text-green-600",
              title: "Тесты и ДЗ",
              desc: "Закрепляйте знания с автопроверкой тестов и обратной связью от кураторов.",
            },
            {
              icon: Users,
              color: "bg-purple-100 text-purple-600",
              title: "Живые вебинары",
              desc: "Встречи с экспертами в прямом эфире с сохранением записи.",
            },
            {
              icon: Award,
              color: "bg-yellow-100 text-yellow-600",
              title: "Сертификаты",
              desc: "Получайте именные сертификаты после прохождения курсов.",
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className={`mb-4 inline-flex rounded-xl p-3 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 text-center"
        style={{
          background:
            "radial-gradient(72.24% 55.65% at 50% 100%, #6E8AFA 0%, #D4DDFF 100%)",
        }}
      >
        <h2 className="mb-4 text-3xl font-bold text-white">
          Готовы начать?
        </h2>
        <p className="mb-8 text-white/80">
          Присоединяйтесь к сотням риэлторов, которые уже учатся на платформе.
        </p>
        <Link href="/register">
          <Button
            size="lg"
            className="h-14 rounded-xl bg-white px-10 text-base text-[#6E8AFA] hover:bg-gray-50"
          >
            Начать бесплатно
            <TrendingUp className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Академия риэлторов. Все права защищены.
      </footer>
    </div>
  );
}
