"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "./rich-text-editor";
import { VideoPlayer } from "@/components/video-player/video-player";
import { WebinarSettings } from "./webinar-settings";
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string | null;
  videoUrl: string | null;
  videoType: string | null;
  muxPlaybackId: string | null;
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
  const router = useRouter();
  const [lesson, setLesson] = useState(initialLesson);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof Lesson, value: unknown) => {
    setLesson((p) => ({ ...p, [field]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          videoType: lesson.videoType,
          isPreview: lesson.isPreview,
          isFree: lesson.isFree,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Урок сохранён");
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = useCallback((html: string) => {
    setLesson((p) => ({ ...p, content: html }));
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/author/courses/${courseId}/edit`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              К курсу
            </Button>
          </Link>
          <h1 className="text-lg font-bold line-clamp-1">{lesson.title}</h1>
          <Badge variant="outline" className="text-xs">
            {lesson.type}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
            Сохранить
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="mb-4 space-y-1">
              <Label>Название урока</Label>
              <Input
                value={lesson.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>

            {lesson.type === "TEXT" && (
              <div>
                <Label className="mb-2 block">Содержание</Label>
                <RichTextEditor
                  content={lesson.content ?? ""}
                  onChange={handleContentChange}
                />
              </div>
            )}

            {lesson.type === "VIDEO" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Тип видео</Label>
                  <Select
                    value={lesson.videoType ?? ""}
                    onValueChange={(v) => update("videoType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YOUTUBE">YouTube</SelectItem>
                      <SelectItem value="RUTUBE">Rutube</SelectItem>
                      <SelectItem value="YANDEX_DISK">Яндекс Диск</SelectItem>
                      <SelectItem value="VIMEO">Vimeo</SelectItem>
                      <SelectItem value="UPLOAD">Загрузить файл (Mux)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {lesson.videoType && lesson.videoType !== "UPLOAD" && (
                  <div className="space-y-1">
                    <Label>URL видео</Label>
                    <Input
                      value={lesson.videoUrl ?? ""}
                      onChange={(e) => update("videoUrl", e.target.value)}
                      placeholder={
                        lesson.videoType === "YOUTUBE"
                          ? "https://youtube.com/watch?v=..."
                          : lesson.videoType === "RUTUBE"
                          ? "https://rutube.ru/video/..."
                          : "https://disk.yandex.ru/i/..."
                      }
                    />
                  </div>
                )}

                {lesson.videoType === "UPLOAD" && (
                  <div className="rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground">
                    <p className="text-sm">Загрузка видео через Mux</p>
                    <p className="mt-1 text-xs">
                      Настройте MUX_TOKEN_ID и MUX_TOKEN_SECRET в .env, затем
                      используйте Mux Direct Uploads
                    </p>
                  </div>
                )}

                {/* Video Preview */}
                {lesson.videoType && (lesson.videoUrl || lesson.muxPlaybackId) && (
                  <div>
                    <Label className="mb-2 block text-sm text-muted-foreground">
                      <Eye className="inline mr-1 h-3.5 w-3.5" />
                      Предпросмотр
                    </Label>
                    <VideoPlayer
                      videoType={lesson.videoType as "YOUTUBE" | "RUTUBE" | "YANDEX_DISK" | "VIMEO" | "UPLOAD"}
                      videoUrl={lesson.videoUrl}
                      muxPlaybackId={lesson.muxPlaybackId}
                      title={lesson.title}
                    />
                  </div>
                )}

                <div>
                  <Label className="mb-2 block">Описание (необязательно)</Label>
                  <RichTextEditor
                    content={lesson.content ?? ""}
                    onChange={handleContentChange}
                  />
                </div>
              </div>
            )}

            {lesson.type === "WEBINAR" && (
              <WebinarSettings lessonId={lesson.id} />
            )}
          </div>
        </div>

        {/* Sidebar: Lesson settings */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-4 space-y-4">
            <h2 className="font-semibold">Настройки урока</h2>

            <div className="space-y-1">
              <Label>Тип урока</Label>
              <Select
                value={lesson.type}
                onValueChange={(v) => update("type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">Видео</SelectItem>
                  <SelectItem value="TEXT">Текст</SelectItem>
                  <SelectItem value="QUIZ">Тест</SelectItem>
                  <SelectItem value="ASSIGNMENT">Домашнее задание</SelectItem>
                  <SelectItem value="WEBINAR">Вебинар</SelectItem>
                </SelectContent>
              </Select>
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
          </div>

          <Button className="w-full" onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить урок
          </Button>
        </div>
      </div>
    </div>
  );
}
