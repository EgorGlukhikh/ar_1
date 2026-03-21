"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Video, Loader2, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CourseType = "COURSE" | "WEBINAR";

const schema = z.object({
  title: z.string().min(3, "Минимум 3 символа"),
});
type FormData = z.infer<typeof schema>;

const types: { value: CourseType; icon: React.ReactNode; label: string; desc: string }[] = [
  {
    value: "COURSE",
    icon: <BookOpen className="h-7 w-7" />,
    label: "Курс",
    desc: "Модули, уроки, видео, тесты, домашние задания",
  },
  {
    value: "WEBINAR",
    icon: <Video className="h-7 w-7" />,
    label: "Вебинар",
    desc: "Онлайн-встреча с датой, временем и ссылкой для входа",
  },
];

export default function NewCoursePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<CourseType>("COURSE");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.title, type: selectedType }),
      });

      if (!res.ok) {
        toast.error("Не удалось создать");
        return;
      }

      const course = await res.json();
      toast.success(selectedType === "WEBINAR" ? "Вебинар создан!" : "Курс создан!");

      if (selectedType === "WEBINAR") {
        router.push(`/author/courses/${course.id}/webinar`);
      } else {
        router.push(`/author/courses/${course.id}/edit`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад
      </button>

      <h1 className="mb-1 text-2xl font-bold text-gray-900">Что создаём?</h1>
      <p className="mb-6 text-sm text-muted-foreground">Выберите тип и задайте название</p>

      {/* Type picker */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {types.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setSelectedType(t.value)}
            className={cn(
              "relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all",
              selectedType === t.value
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            {selectedType === t.value && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500">
                <Check className="h-3 w-3 text-white" />
              </span>
            )}
            <span className={selectedType === t.value ? "text-purple-600" : "text-gray-400"}>
              {t.icon}
            </span>
            <div>
              <p className="font-semibold text-gray-900">{t.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Название {selectedType === "WEBINAR" ? "вебинара" : "курса"}
          </CardTitle>
          <CardDescription>Можно изменить позже</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Название</Label>
              <Input
                placeholder={
                  selectedType === "WEBINAR"
                    ? "Например: Вебинар по ипотеке"
                    : "Например: Основы риэлторства"
                }
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Создать {selectedType === "WEBINAR" ? "вебинар" : "курс"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
