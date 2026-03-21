"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle, PlayCircle, BookOpen, Award, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Lesson {
  id: string;
  title: string;
  type: string;
  isPreview: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Props {
  course: { slug: string; title: string; modules: Module[] };
  currentLessonId: string;
  completedIds: Set<string>;
  enrolled: boolean;
}

const lessonIcon: Record<string, React.ReactNode> = {
  VIDEO: <PlayCircle className="h-3.5 w-3.5" />,
  TEXT: <BookOpen className="h-3.5 w-3.5" />,
  QUIZ: <CheckCircle className="h-3.5 w-3.5" />,
  ASSIGNMENT: <Award className="h-3.5 w-3.5" />,
};

export function LessonSidebar({
  course,
  currentLessonId,
  completedIds,
  enrolled,
}: Props) {
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progress = allLessons.length
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0;

  return (
    <aside className="hidden w-72 shrink-0 overflow-y-auto border-r bg-white lg:flex lg:flex-col">
      <div className="border-b p-4">
        <p className="text-sm font-semibold line-clamp-2">{course.title}</p>
        <div className="mt-2 flex items-center gap-2">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <nav className="flex-1 py-2">
        {course.modules.map((module) => (
          <div key={module.id}>
            <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {module.title}
            </p>
            {module.lessons.map((lesson) => {
              const isCompleted = completedIds.has(lesson.id);
              const isCurrent = lesson.id === currentLessonId;
              const isAccessible = enrolled || lesson.isPreview;

              return (
                <div key={lesson.id}>
                  {isAccessible ? (
                    <Link
                      href={`/courses/${course.slug}/learn/${lesson.id}`}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                        isCurrent
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <span className={cn(isCompleted ? "text-green-500" : "text-gray-400")}>
                        {isCompleted ? (
                          <CheckCircle className="h-3.5 w-3.5" />
                        ) : (
                          lessonIcon[lesson.type] ?? <BookOpen className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="line-clamp-1 flex-1">{lesson.title}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400">
                      <Lock className="h-3.5 w-3.5" />
                      <span className="line-clamp-1 flex-1">{lesson.title}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
