"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

interface Props {
  lessonId: string;
  courseId: string;
  slug: string;
  nextLessonId?: string;
  isCompleted: boolean;
}

export function CompleteButton({
  lessonId,
  courseId,
  slug,
  nextLessonId,
  isCompleted,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (isCompleted) {
      if (nextLessonId) {
        router.push(`/courses/${slug}/learn/${nextLessonId}`);
      }
      return;
    }

    setLoading(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, courseId }),
      });

      toast.success("Урок отмечен как пройденный!");
      router.refresh();

      if (nextLessonId) {
        router.push(`/courses/${slug}/learn/${nextLessonId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleComplete}
      disabled={loading}
      variant={isCompleted ? "secondary" : "default"}
      className="shrink-0 gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="h-4 w-4" />
      )}
      {isCompleted
        ? nextLessonId
          ? "Следующий урок"
          : "Пройдено"
        : "Отметить пройденным"}
    </Button>
  );
}
