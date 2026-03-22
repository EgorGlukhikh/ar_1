"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  isPreview: boolean;
  isFree: boolean;
}

export function LessonEditor({
  courseId,
  lesson: initialLesson,
}: {
  courseId: string;
  lesson: Lesson;
}) {
  const [lesson, setLesson] = useState(initialLesson);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof Lesson, value: unknown) =>
    setLesson((p) => ({ ...p, [field]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lesson.title,
          isPreview: lesson.isPreview,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Настройки урока сохранены");
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/author/courses/${courseId}/edit`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            К курсу
          </Button>
        </Link>
        <h1 className="text-lg font-bold truncate">{lesson.title}</h1>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-5">
        <h2 className="font-semibold">Настройки урока</h2>

        <div className="space-y-1">
          <Label>Название</Label>
          <Input
            value={lesson.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Бесплатный просмотр</Label>
            <p className="text-xs text-muted-foreground">
              Доступен без записи на курс
            </p>
          </div>
          <Switch
            checked={lesson.isPreview}
            onCheckedChange={(v) => update("isPreview", v)}
          />
        </div>

        <Button onClick={save} disabled={saving} className="w-full">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Сохранить
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Для редактирования содержимого — нажмите карандаш на нужном блоке в{" "}
        <Link
          href={`/author/courses/${courseId}/edit`}
          className="underline hover:text-primary"
        >
          редакторе курса
        </Link>
      </p>
    </div>
  );
}
