import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GraduationCap, Users, Clock, Search } from "lucide-react";
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
      _count: { select: { enrollments: true, modules: true } },
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
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Каталог курсов</h1>
      <p className="mb-8 text-muted-foreground">
        {courses.length} курс{courses.length !== 1 ? "ов" : ""} доступно
      </p>

      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        {/* Search */}
        <form className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={params.q}
              placeholder="Поиск по курсам..."
              className="pl-9"
            />
          </div>
        </form>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/courses"
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              !params.category
                ? "bg-primary text-primary-foreground"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Все
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/courses?category=${cat.id}`}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                params.category === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="py-20 text-center">
          <GraduationCap className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <p className="text-lg text-muted-foreground">Курсы не найдены</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    <GraduationCap className="h-14 w-14 text-blue-400" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {levelLabel[course.level] ?? course.level}
                    </Badge>
                    {course.isFree && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                        Бесплатно
                      </Badge>
                    )}
                    {course.category && (
                      <Badge variant="outline" className="text-xs">
                        {course.category.name}
                      </Badge>
                    )}
                  </div>

                  <h2 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">
                    {course.title}
                  </h2>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {course.author.name}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course._count.enrollments}
                    </span>
                    {course.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {course.duration}
                      </span>
                    )}
                    <span className="font-semibold text-gray-900">
                      {course.isFree
                        ? "Бесплатно"
                        : course.price
                        ? `${course.price.toLocaleString()} ₽`
                        : "По запросу"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
