import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VideoPlayer } from "@/components/video-player/video-player";
import { LessonSidebar } from "@/components/learn/lesson-sidebar";
import { LessonContent } from "@/components/learn/lesson-content";
import { CompleteButton } from "@/components/learn/complete-button";
import { QuizBlock } from "@/components/learn/quiz-block";
import { AssignmentBlock } from "@/components/learn/assignment-block";

interface PageProps {
  params: Promise<{ slug: string; lessonId: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { slug, lessonId } = await params;
  const session = await auth();

  if (!session) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!course) notFound();

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      quiz: { include: { questions: { include: { options: true } } } },
      assignment: true,
      attachments: true,
    },
  });

  if (!lesson) notFound();

  // Check access: enrolled, preview lesson, or admin/author bypass
  const isPrivileged =
    session.user.role === "ADMIN" || session.user.role === "AUTHOR";
  if (!enrollment && !lesson.isPreview && !isPrivileged) {
    redirect(`/courses/${slug}`);
  }

  const progress = session.user.id
    ? await prisma.lessonProgress.findMany({
        where: {
          userId: session.user.id,
          lesson: { module: { courseId: course.id } },
        },
        select: { lessonId: true },
      })
    : [];

  const completedIds = new Set(progress.map((p) => p.lessonId));
  const isCompleted = completedIds.has(lessonId);

  // All lesson ids in order
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = allLessons[currentIndex + 1] ?? null;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <LessonSidebar
        course={course}
        currentLessonId={lessonId}
        completedIds={completedIds}
        enrolled={!!enrollment}
      />

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl p-4 pb-28 lg:p-6 lg:pb-6">
          {/* Video */}
          {lesson.type === "VIDEO" && (lesson.videoType || lesson.muxPlaybackId) && (
            <div className="mb-6">
              <VideoPlayer
                videoType={lesson.videoType ?? "UPLOAD"}
                videoUrl={lesson.videoUrl}
                muxPlaybackId={lesson.muxPlaybackId}
                title={lesson.title}
                lessonId={lessonId}
                subtitles={lesson.subtitles}
              />
            </div>
          )}

          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-xl font-bold sm:text-2xl">{lesson.title}</h1>
            {enrollment && (
              <CompleteButton
                lessonId={lessonId}
                courseId={course.id}
                slug={slug}
                nextLessonId={nextLesson?.id}
                isCompleted={isCompleted}
              />
            )}
          </div>

          {/* Text content */}
          {lesson.content && (
            <LessonContent content={lesson.content} className="mt-6" />
          )}

          {/* Attachments */}
          {lesson.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Материалы урока
              </h3>
              <div className="space-y-2">
                {lesson.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    download
                    className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:bg-gray-50"
                  >
                    📎 {att.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Quiz */}
          {lesson.type === "QUIZ" && lesson.quiz && enrollment && (
            <div className="mt-6">
              <QuizBlock
                quiz={lesson.quiz}
                onPassed={() => {
                  // CompleteButton will handle marking complete
                }}
              />
            </div>
          )}

          {/* Assignment */}
          {lesson.type === "ASSIGNMENT" && lesson.assignment && enrollment && (
            <div className="mt-6">
              <AssignmentBlock
                assignment={lesson.assignment}
                onApproved={() => {
                  // auto-mark complete when approved
                }}
              />
            </div>
          )}

          {/* Webinar lesson type removed — webinars are now top-level course type */}
        </div>
      </div>
    </div>
  );
}
