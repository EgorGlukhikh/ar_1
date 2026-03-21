import Link from "next/link";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col bg-white min-h-[100vh] justify-center items-center xl:h-[100vh] xl:relative xl:flex-row xl:py-0 xl:items-stretch">
      {/* Logo — absolute on xl */}
      <header className="mb-8 lg:mb-12 xl:mb-0 xl:absolute xl:z-10 xl:w-full xl:p-10 xl:top-0">
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          {/* White logo for xl (shown over gradient) */}
          <div className="hidden xl:flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="text-lg font-bold text-white leading-tight">
              Академия<br />
              <span className="font-normal text-white/80 text-sm">Союз риэлторов</span>
            </span>
          </div>
          {/* Colored logo for mobile */}
          <div className="xl:hidden flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-[#6E8AFA]" />
            <span className="text-lg font-bold text-gray-900 leading-tight">
              Академия<br />
              <span className="font-normal text-gray-500 text-sm">Союз риэлторов</span>
            </span>
          </div>
        </Link>
      </header>

      {/* Left panel — gradient with decoration */}
      <div
        className="hidden relative xl:flex xl:flex-col xl:w-[50vw] 2xl:w-[43.4vw] overflow-hidden"
        style={{
          background: "radial-gradient(72.24% 55.65% at 50% 100%, #D4DDFF 0%, #6E8AFA 100%)",
        }}
      >
        {/* Decorative floating cards */}
        <div className="absolute bottom-12 left-12 right-12 flex flex-col gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold">Профессиональное обучение</span>
            </div>
            <p className="text-white/80 text-sm">
              Курсы от ведущих экспертов рынка недвижимости
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white flex-1">
              <Users className="h-5 w-5 mb-1" />
              <div className="font-bold text-2xl">500+</div>
              <div className="text-white/80 text-xs">Выпускников</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white flex-1">
              <Award className="h-5 w-5 mb-1" />
              <div className="font-bold text-2xl">30+</div>
              <div className="text-white/80 text-xs">Курсов</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white flex-1">
              <GraduationCap className="h-5 w-5 mb-1" />
              <div className="font-bold text-2xl">95%</div>
              <div className="text-white/80 text-xs">Трудоустройство</div>
            </div>
          </div>
        </div>

        {/* Large decorative circle */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-white/10" />
        <div className="absolute top-[60px] right-[-60px] w-[250px] h-[250px] rounded-full bg-white/10" />
      </div>

      {/* Right panel — form */}
      <div className="w-full flex items-center justify-center xl:w-[50vw] 2xl:w-[56.6vw] px-6 py-10 xl:py-0">
        {children}
      </div>
    </section>
  );
}
