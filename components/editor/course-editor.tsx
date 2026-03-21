"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Loader2 as UploadLoader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ModuleList } from "@/components/editor/module-list";
import { Save, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category { id: string; name: string }

interface Lesson {
  id: string; title: string; order: number; type: string;
  isPreview: boolean; videoType: string | null; videoUrl: string | null;
}

interface Module {
  id: string; title: string; order: number;
  lessons: Lesson[];
}

interface Course {
  id: string; title: string; slug: string; description: string | null;
  coverImage: string | null; price: number | null; isFree: boolean;
  isPublished: boolean; level: string; duration: string | null;
  categoryId: string | null; modules: Module[];
}

export function CourseEditor({
  course: initialCourse,
  categories,
}: {
  course: Course;
  categories: Category[];
}) {
  const router = useRouter();
  const [course, setCourse] = useState(initialCourse);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const updateField = (field: keyof Course, value: unknown) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          price: course.price,
          isFree: course.isFree,
          level: course.level,
          duration: course.duration,
          categoryId: course.categoryId,
          coverImage: course.coverImage,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Сохранено");
      router.refresh();
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setCourse((p) => ({ ...p, isPublished: updated.isPublished }));
      toast.success(updated.isPublished ? "Курс опубликован" : "Курс снят с публикации");
    } catch {
      toast.error("Ошибка");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/author/courses">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </Link>
          <h1 className="text-xl font-bold line-clamp-1">{course.title}</h1>
          <Badge variant={course.isPublished ? "default" : "secondary"}>
            {course.isPublished ? "Опубликован" : "Черновик"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
            Сохранить
          </Button>
          <Button
            size="sm"
            variant={course.isPublished ? "destructive" : "default"}
            onClick={togglePublish}
            disabled={publishing}
          >
            {publishing ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : course.isPublished ? (
              <EyeOff className="mr-1 h-3.5 w-3.5" />
            ) : (
              <Eye className="mr-1 h-3.5 w-3.5" />
            )}
            {course.isPublished ? "Снять с публикации" : "Опубликовать"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main: Modules & Lessons */}
        <div className="lg:col-span-2">
          <ModuleList courseId={course.id} modules={course.modules} />
        </div>

        {/* Sidebar: Course settings */}
        <div className="space-y-4">
          {/* Basic info */}
          <div className="rounded-lg border bg-white p-4 space-y-4">
            <h2 className="font-semibold">Основная информация</h2>

            <div className="space-y-1">
              <Label>Название</Label>
              <Input
                value={course.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Описание</Label>
              <Textarea
                value={course.description ?? ""}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                placeholder="Что узнает студент..."
              />
            </div>

            <div className="space-y-1">
              <Label>Категория</Label>
              <Select
                value={course.categoryId ?? ""}
                onValueChange={(v) => updateField("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Уровень</Label>
              <Select
                value={course.level}
                onValueChange={(v) => updateField("level", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Начинающий</SelectItem>
                  <SelectItem value="INTERMEDIATE">Средний</SelectItem>
                  <SelectItem value="ADVANCED">Продвинутый</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Продолжительность</Label>
              <Input
                placeholder="Например: 8 часов"
                value={course.duration ?? ""}
                onChange={(e) => updateField("duration", e.target.value)}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-lg border bg-white p-4 space-y-4">
            <h2 className="font-semibold">Цена</h2>

            <div className="flex items-center justify-between">
              <Label>Бесплатный курс</Label>
              <Switch
                checked={course.isFree}
                onCheckedChange={(v) => updateField("isFree", v)}
              />
            </div>

            {!course.isFree && (
              <div className="space-y-1">
                <Label>Цена (₽)</Label>
                <Input
                  type="number"
                  min={0}
                  value={course.price ?? ""}
                  onChange={(e) =>
                    updateField("price", e.target.value ? parseFloat(e.target.value) : null)
                  }
                  placeholder="9900"
                />
              </div>
            )}
          </div>

          {/* Cover image */}
          <CoverImageUpload
            value={course.coverImage ?? ""}
            onChange={(url) => updateField("coverImage", url)}
          />

          <Button className="w-full" onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить изменения
          </Button>
        </div>
      </div>
    </div>
  );
}

function CoverImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка загрузки");
      onChange(data.url);
      toast.success("Обложка загружена");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка загрузки";
      if (msg.includes("S3")) {
        toast.error("Загрузка файлов не настроена. Вставьте URL обложки вручную.");
      } else {
        toast.error(msg);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <h2 className="font-semibold">Обложка</h2>

      {/* Preview */}
      {value ? (
        <div className="relative">
          <img src={value} alt="Cover" className="h-36 w-full rounded-lg object-cover" />
          <button
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white hover:bg-black/70"
          >
            ✕ Удалить
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary hover:text-primary transition-colors"
        >
          {uploading ? (
            <UploadLoader className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Upload className="h-6 w-6" />
              <span className="text-sm">Нажмите для загрузки</span>
              <span className="text-xs">JPG, PNG, WebP до 5 МБ</span>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* URL fallback */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">или вставьте URL</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}
