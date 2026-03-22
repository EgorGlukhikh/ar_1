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
import { RichTextEditor } from "./rich-text-editor";
import { VideoPlayer } from "@/components/video-player/video-player";
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  Captions,
  Trash2,
  PlayCircle,
  FileText,
  CheckSquare,
  ClipboardList,
  Video,
} from "lucide-react";
import Link from "next/link";

const BLOCK_ICONS: Record<string, React.ReactNode> = {
  VIDEO:      <PlayCircle className="h-4 w-4 text-blue-500" />,
  TEXT:       <FileText className="h-4 w-4 text-gray-500" />,
  QUIZ:       <CheckSquare className="h-4 w-4 text-green-600" />,
  ASSIGNMENT: <ClipboardList className="h-4 w-4 text-orange-500" />,
  WEBINAR:    <Video className="h-4 w-4 text-purple-500" />,
};

const BLOCK_LABELS: Record<string, string> = {
  VIDEO: "Видео", TEXT: "Текст", QUIZ: "Тест",
  ASSIGNMENT: "Задание", WEBINAR: "Вебинар",
};

interface Block {
  id: string;
  lessonId: string;
  type: string;
  order: number;
  title: string | null;
  content: string | null;
  videoUrl: string | null;
  videoType: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  subtitles: string | null;
  isPreview: boolean;
}

export function BlockEditor({
  courseId,
  lessonId,
  lessonTitle,
  block: initialBlock,
}: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  block: Block;
}) {
  const router = useRouter();
  const [block, setBlock] = useState(initialBlock);
  const [saving, setSaving] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const update = (field: keyof Block, value: unknown) =>
    setBlock((p) => ({ ...p, [field]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/blocks/${block.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:        block.title,
          content:      block.content,
          videoUrl:     block.videoUrl,
          videoType:    block.videoType,
          isPreview:    block.isPreview,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Блок сохранён");
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const transcribe = async () => {
    setTranscribing(true);
    try {
      // Transcribe via video URL saved on the block
      const res = await fetch(`/api/blocks/${block.id}/transcribe`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message ?? "Ошибка субтитров"); return; }
      update("subtitles", data.vtt);
      toast.success(`Субтитры созданы (${data.segmentCount} фрагментов)`);
    } finally {
      setTranscribing(false);
    }
  };

  const deleteSubtitles = async () => {
    await fetch(`/api/blocks/${block.id}/transcribe`, { method: "DELETE" });
    update("subtitles", null);
    toast.success("Субтитры удалены");
  };

  const handleContentChange = useCallback(
    (html: string) => setBlock((p) => ({ ...p, content: html })),
    []
  );

  const canTranscribe =
    block.videoType &&
    !["YOUTUBE", "RUTUBE", "VIMEO", "YANDEX_DISK"].includes(block.videoType) &&
    (block.videoUrl || block.muxPlaybackId);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/author/courses/${courseId}/edit`}>
            <Button variant="ghost" size="sm" className="gap-1 shrink-0">
              <ArrowLeft className="h-4 w-4" />
              К курсу
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground truncate hidden sm:block">
            {lessonTitle}
          </span>
          <span className="text-muted-foreground">/</span>
          <div className="flex items-center gap-1.5 min-w-0">
            {BLOCK_ICONS[block.type]}
            <h1 className="text-base font-bold truncate">
              {block.title || BLOCK_LABELS[block.type]}
            </h1>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {BLOCK_LABELS[block.type] ?? block.type}
          </Badge>
        </div>
        <Button size="sm" onClick={save} disabled={saving} className="gap-1.5 shrink-0">
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Сохранить
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Main editor ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Block title */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="space-y-1">
              <Label>Название блока</Label>
              <Input
                value={block.title ?? ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder={BLOCK_LABELS[block.type]}
              />
            </div>
          </div>

          {/* ── VIDEO ── */}
          {block.type === "VIDEO" && (
            <div className="rounded-lg border bg-card p-4 space-y-4">
              <h2 className="font-semibold text-sm">Видео</h2>

              <div className="space-y-1">
                <Label>Источник</Label>
                <Select
                  value={block.videoType ?? ""}
                  onValueChange={(v) => update("videoType", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите источник" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YOUTUBE">YouTube</SelectItem>
                    <SelectItem value="RUTUBE">Rutube</SelectItem>
                    <SelectItem value="YANDEX_DISK">Яндекс Диск</SelectItem>
                    <SelectItem value="VIMEO">Vimeo</SelectItem>
                    <SelectItem value="UPLOAD">Загрузить (Mux)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {block.videoType && block.videoType !== "UPLOAD" && (
                <div className="space-y-1">
                  <Label>URL видео</Label>
                  <Input
                    value={block.videoUrl ?? ""}
                    onChange={(e) => update("videoUrl", e.target.value)}
                    placeholder={
                      block.videoType === "YOUTUBE"
                        ? "https://youtube.com/watch?v=..."
                        : block.videoType === "RUTUBE"
                        ? "https://rutube.ru/video/..."
                        : "https://disk.yandex.ru/i/..."
                    }
                  />
                </div>
              )}

              {block.videoType === "UPLOAD" && (
                <div className="rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground">
                  <p className="text-sm">Загрузка через Mux Direct Uploads</p>
                  <p className="mt-1 text-xs">Настройте MUX_TOKEN_ID и MUX_TOKEN_SECRET в .env</p>
                </div>
              )}

              {/* Preview */}
              {block.videoType && (block.videoUrl || block.muxPlaybackId) && (
                <div>
                  <Label className="mb-2 flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" /> Предпросмотр
                  </Label>
                  <VideoPlayer
                    videoType={block.videoType as "YOUTUBE" | "RUTUBE" | "YANDEX_DISK" | "VIMEO" | "UPLOAD"}
                    videoUrl={block.videoUrl}
                    muxPlaybackId={block.muxPlaybackId}
                    title={block.title ?? ""}
                  />
                </div>
              )}

              {/* Subtitles */}
              {canTranscribe && (
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Captions className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Субтитры</span>
                      {block.subtitles ? (
                        <Badge className="border-0 bg-green-100 text-green-700 text-xs">Готовы</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Нет</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {block.subtitles && (
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 text-xs text-red-500 hover:text-red-700"
                          onClick={deleteSubtitles}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Удалить
                        </Button>
                      )}
                      <Button
                        variant="outline" size="sm"
                        className="h-7 text-xs"
                        onClick={transcribe}
                        disabled={transcribing}
                      >
                        {transcribing ? (
                          <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />Генерируем...</>
                        ) : (
                          <><Captions className="mr-1 h-3.5 w-3.5" />{block.subtitles ? "Пересоздать" : "Создать (Whisper)"}</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Groq Whisper AI — бесплатно, до 2 ч/день. Требует{" "}
                    <code className="rounded bg-muted px-1">GROQ_API_KEY</code>
                  </p>
                </div>
              )}

              {/* Optional description */}
              <div>
                <Label className="mb-2 block">Описание (необязательно)</Label>
                <RichTextEditor content={block.content ?? ""} onChange={handleContentChange} />
              </div>
            </div>
          )}

          {/* ── TEXT ── */}
          {block.type === "TEXT" && (
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h2 className="font-semibold text-sm">Содержание</h2>
              <RichTextEditor content={block.content ?? ""} onChange={handleContentChange} />
            </div>
          )}

          {/* ── ASSIGNMENT ── */}
          {block.type === "ASSIGNMENT" && (
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h2 className="font-semibold text-sm">Задание</h2>
              <p className="text-xs text-muted-foreground">
                Опишите задание для студентов. Они смогут загрузить ответ, куратор проверит.
              </p>
              <RichTextEditor content={block.content ?? ""} onChange={handleContentChange} />
            </div>
          )}

          {/* ── QUIZ ── */}
          {block.type === "QUIZ" && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <h2 className="font-semibold text-sm">Тест</h2>
              <div className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                <CheckSquare className="mx-auto mb-2 h-8 w-8 opacity-40" />
                <p>Редактор тестов в разработке.</p>
                <p className="mt-1 text-xs">
                  Пока используйте вкладку{" "}
                  <Link
                    href={`/author/courses/${courseId}/lessons/${lessonId}`}
                    className="underline hover:text-primary"
                  >
                    редактора урока
                  </Link>{" "}
                  для создания вопросов.
                </p>
              </div>
            </div>
          )}

          {/* ── WEBINAR ── */}
          {block.type === "WEBINAR" && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <h2 className="font-semibold text-sm">Вебинар</h2>
              <div className="space-y-1">
                <Label>Ссылка на трансляцию / запись</Label>
                <Input
                  value={block.videoUrl ?? ""}
                  onChange={(e) => update("videoUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label className="mb-2 block">Описание</Label>
                <RichTextEditor content={block.content ?? ""} onChange={handleContentChange} />
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <h2 className="font-semibold text-sm">Настройки блока</h2>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Бесплатный просмотр</Label>
                <p className="text-xs text-muted-foreground">
                  Доступен без записи на курс
                </p>
              </div>
              <Switch
                checked={block.isPreview}
                onCheckedChange={(v) => update("isPreview", v)}
              />
            </div>
          </div>

          <Button className="w-full" onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить блок
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/author/courses/${courseId}/edit`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к курсу
          </Button>
        </div>
      </div>
    </div>
  );
}
