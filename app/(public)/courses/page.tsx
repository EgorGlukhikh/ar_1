import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GraduationCap, Users, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getCourses(query?: string, category?: string) {
  return prisma.course.findMany({
    where: {
      isPublished: true,
      ...(query && {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      }),
      ...(category && { categoryId: category }),
    },
    include: {
      author: { select: { name: true } },
      category: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

const levelLabel: Record<string, string> = {
  BEGINNER: "Начинающий",
  INTERMEDIATE: "Средний",
  ADVANCED: "Продвинутый",
};

const gradients = [
  "linear-gradient(135deg, #7C5CFC, #C084FC)",
  "linear-gradient(135deg, #F97316, #FCD34D)",
  "linear-gradient(135deg, #22C55E, #86EFAC)",
  "linear-gradient(135deg, #EC4899, #F9A8D4)",
  "linear-gradient(135deg, #3B82F6, #93C5FD)",
  "linear-gradient(135deg, #14B8A6, #5EEAD4)",
];

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const [courses, categories] = await Promise.all([
    getCourses(params.q, params.category),
    getCategories(),
  ]);

  return (
    <div style={{ background: "#F5F4FF" }} className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-10">
          <h1 className="mb-1 text-3xl font-extrabold text-gray-900">Каталог курсов</h1>
          <p className="text-muted-foreground">
            {courses.length} {courses.length === 1 ? "курс" : courses.length < 5 ? "курса" : "курсов"} доступно
          </p>

          {/* Search + filter */}
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
            <form className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={params.q}
                  placeholder="Поиск по курсам..."
                  className="pl-9 bg-gray-50 border-gray-200 h-10"
                />
              </div>
            </form>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/courses"
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  !params.category
                    ? "text-white border-transparent"
                    : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700"
                }`}
                style={!params.category ? { background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" } : {}}
              >
                Все
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/courses?category=${cat.id}`}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    params.category === cat.id
                      ? "text-white border-transparent"
                      : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700"
                  }`}
                  style={params.category === cat.id ? { background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" } : {}}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-10">
        {courses.length === 0 ? (
          <div className="py-24 text-center">
            <GraduationCap className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">Курсы не найдены</p>
            <p className="mt-1 text-sm text-gray-400">Попробуйте изменить запрос или категорию</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course, i) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  {course.coverImage ? (
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-40 items-center justify-center"
                      style={{ background: gradients[i % gradients.length] }}
                    >
                      <GraduationCap className="h-14 w-14 text-white/70" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {levelLabel[course.level] ?? course.level}
                      </Badge>
                      {course.isFree && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                          Бесплатно
                        </Badge>
                      )}
                    </div>

                    <h2 className="mb-1 flex-1 line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors leading-snug">
                      {course.title}
                    </h2>
                    <p className="mb-3 text-xs text-muted-foreground">{course.author.name}</p>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="h-3.5 w-3.5" />
                        {course._count.enrollments}
                      </span>
                      <span
                        className="rounded-xl px-3 py-1 text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
                      >
                        {course.isFree || !course.price
                          ? "Бесплатно"
                          : `${course.price.toLocaleString("ru")} ₽`}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
