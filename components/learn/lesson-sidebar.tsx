"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle, PlayCircle, BookOpen, Award, Lock, Menu, X, List } from "lucide-react";
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

function SidebarContent({
  course,
  currentLessonId,
  completedIds,
  enrolled,
  onLinkClick,
}: Props & { onLinkClick?: () => void }) {
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progress = allLessons.length
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0;

  return (
    <>
      <div className="border-b p-4">
        <p className="text-sm font-semibold line-clamp-2">{course.title}</p>
        <div className="mt-2 flex items-center gap-2">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{completedCount}/{allLessons.length}</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
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
                      onClick={onLinkClick}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                        isCurrent
                          ? "bg-purple-50 text-purple-700 font-medium border-r-2 border-purple-500"
                          : "hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <span className={cn("shrink-0", isCompleted ? "text-green-500" : "text-gray-400")}>
                        {isCompleted ? (
                          <CheckCircle className="h-3.5 w-3.5" />
                        ) : (
                          lessonIcon[lesson.type] ?? <BookOpen className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="line-clamp-2 flex-1 leading-snug">{lesson.title}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300">
                      <Lock className="h-3.5 w-3.5 shrink-0" />
                      <span className="line-clamp-1 flex-1">{lesson.title}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </>
  );
}

export function LessonSidebar(props: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-r bg-white lg:flex">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile: overlay + drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="text-sm font-bold text-gray-900">Содержание курса</span>
          <button onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <SidebarContent {...props} onLinkClick={() => setMobileOpen(false)} />
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-xl lg:hidden"
        style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
      >
        <List className="h-4 w-4" />
        Содержание курса
      </button>
    </>
  );
}
