"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().min(3, "Минимум 3 символа"),
});

type FormData = z.infer<typeof schema>;

export default function NewCoursePage() {
  const router = useRouter();
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
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        toast.error("Не удалось создать курс");
        return;
      }

      const course = await res.json();
      toast.success("Курс создан!");
      router.push(`/author/courses/${course.id}/edit`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Новый курс</CardTitle>
          <CardDescription>Придумайте название. Остальное — в редакторе.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Название курса</Label>
              <Input
                placeholder="Например: Основы риэлторства"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Создать курс
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
