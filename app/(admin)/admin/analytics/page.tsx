import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingDown, Eye, Clock } from "lucide-react";
import { LessonDropoffChart } from "@/components/admin/lesson-dropoff-chart";

async function getAnalyticsOverview() {
  // Courses with their lessons and event counts
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              _count: { select: { lessonEvents: true } },
              lessonEvents: {
                select: { userId: true, event: true, percent: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return courses.map((course) => {
    const lessons = course.modules.flatMap((m) => m.lessons);

    const enriched = lessons.map((lesson) => {
      const events = lesson.lessonEvents;
      const viewers = new Set(events.map((e) => e.userId)).size;

      // avg watch % from heartbeat/pause events that have percent
      const percents = events
        .filter((e) => e.percent !== null)
        .map((e) => e.percent as number);
      const avgPct = percents.length
        ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length)
        : null;

      // Drop-off rate: viewers who never reached 80%
      const maxPerUser = new Map<string, number>();
      for (const e of events) {
        if (e.percent !== null) {
          const cur = maxPerUser.get(e.userId) ?? 0;
          if ((e.percent as number) > cur) maxPerUser.set(e.userId, e.percent as number);
        }
      }
      const completedCount = [...maxPerUser.values()].filter((p) => p >= 80).length;
      const dropOffRate =
        maxPerUser.size > 0
          ? Math.round(((maxPerUser.size - completedCount) / maxPerUser.size) * 100)
          : null;

      return {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        eventCount: lesson._count.lessonEvents,
        viewers,
        avgPct,
        dropOffRate,
      };
    });

    return { id: course.id, title: course.title, slug: course.slug, lessons: enriched };
  });
}

export default async function AdminAnalyticsPage() {
  const courses = await getAnalyticsOverview();

  const totalEvents = courses
    .flatMap((c) => c.lessons)
    .reduce((a, l) => a + l.eventCount, 0);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold">Поведенческая аналитика</h1>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Отслеживает: запуск / пауза / перемотка / окончание / закрытие вкладки.{" "}
        <strong>{totalEvents.toLocaleString()}</strong> событий собрано.
      </p>

      {courses.length === 0 && (
        <p className="text-muted-foreground">Нет опубликованных курсов.</p>
      )}

      <div className="space-y-8">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {course.lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground">Уроков нет.</p>
              ) : (
                <div className="space-y-3">
                  {course.lessons.map((lesson) => (
                    <div key={lesson.id} className="rounded-lg border p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex-1 truncate text-sm font-medium">
                          {lesson.title}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {lesson.viewers} зрителей
                          </span>
                          {lesson.avgPct !== null && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              ср. {lesson.avgPct}% просмотрено
                            </span>
                          )}
                          {lesson.dropOffRate !== null && (
                            <Badge
                              className={`border-0 text-xs ${
                                lesson.dropOffRate > 50
                                  ? "bg-red-100 text-red-700"
                                  : lesson.dropOffRate > 25
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              <TrendingDown className="mr-1 h-3 w-3" />
                              {lesson.dropOffRate}% ушли до 80%
                            </Badge>
                          )}
                          {lesson.eventCount === 0 && (
                            <span className="text-muted-foreground">нет данных</span>
                          )}
                        </div>
                      </div>

                      {/* Inline drop-off chart */}
                      {lesson.eventCount > 0 && (
                        <LessonDropoffChart lessonId={lesson.id} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
