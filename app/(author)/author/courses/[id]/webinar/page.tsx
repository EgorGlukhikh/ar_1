"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Link as LinkIcon,
  Video,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  Users,
  StopCircle,
} from "lucide-react";

type WebinarStatus = "SCHEDULED" | "LIVE" | "ENDED";

interface Webinar {
  id: string;
  scheduledAt: string;
  duration: number | null;
  joinUrl: string | null;
  recordingUrl: string | null;
  status: WebinarStatus;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  webinar: Webinar | null;
}

const statusLabel: Record<WebinarStatus, string> = {
  SCHEDULED: "Запланирован",
  LIVE: "В эфире",
  ENDED: "Завершён",
};

const statusColor: Record<WebinarStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  LIVE: "bg-red-100 text-red-700",
  ENDED: "bg-gray-100 text-gray-600",
};

function toLocalDatetime(iso: string) {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function WebinarEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("");
  const [joinUrl, setJoinUrl] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((data: Course) => {
        setCourse(data);
        if (data.webinar) {
          setScheduledAt(toLocalDatetime(data.webinar.scheduledAt));
          setDuration(data.webinar.duration?.toString() ?? "");
          setJoinUrl(data.webinar.joinUrl ?? "");
          setRecordingUrl(data.webinar.recordingUrl ?? "");
        }
      });
  }, [id]);

  const save = async () => {
    if (!scheduledAt) { toast.error("Укажите дату и время"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/webinars/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt: new Date(scheduledAt).toISOString(),
          duration: duration ? Number(duration) : null,
          joinUrl: joinUrl || null,
          recordingUrl: recordingUrl || null,
        }),
      });
      if (!res.ok) throw new Error();
      const w = await res.json();
      setCourse((c) => c ? { ...c, webinar: w } : c);
      toast.success("Сохранено");
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!course) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setCourse((c) => c ? { ...c, isPublished: updated.isPublished } : c);
      toast.success(updated.isPublished ? "Опубликован" : "Снят с публикации");
    } catch {
      toast.error("Ошибка");
    } finally {
      setPublishing(false);
    }
  };

  const endWebinar = async () => {
    if (!confirm("Завершить вебинар и выдать сертификаты участникам?")) return;
    setEnding(true);
    try {
      const res = await fetch(`/api/webinars/${id}/end`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      toast.success(`Завершён. Сертификатов выдано: ${data.certificates}`);
      setCourse((c) =>
        c && c.webinar ? { ...c, webinar: { ...c.webinar!, status: "ENDED" } } : c
      );
    } catch {
      toast.error("Ошибка");
    } finally {
      setEnding(false);
    }
  };

  if (!course) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const webinar = course.webinar;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">Вебинар</Badge>
            {webinar && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[webinar.status]}`}>
                {statusLabel[webinar.status]}
              </span>
            )}
            <Badge
              variant={course.isPublished ? "default" : "secondary"}
              className="text-xs"
            >
              {course.isPublished ? (
                <><Eye className="mr-1 h-3 w-3" />Опубликован</>
              ) : (
                <><EyeOff className="mr-1 h-3 w-3" />Черновик</>
              )}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {webinar?.status === "LIVE" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={endWebinar}
              disabled={ending}
              className="gap-1.5"
            >
              {ending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StopCircle className="h-4 w-4" />}
              Завершить эфир
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={togglePublish}
            disabled={publishing}
            className="gap-1.5"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              course.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />
            )}
            {course.isPublished ? "Снять" : "Опубликовать"}
          </Button>
          {course.isPublished && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/courses/${course.slug}`, "_blank")}
              className="gap-1.5"
            >
              <ExternalLink className="h-4 w-4" />
              Посмотреть
            </Button>
          )}
        </div>
      </div>

      {/* Settings form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Настройки вебинара</CardTitle>
          <CardDescription>Дата, ссылка и запись</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Date & time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                Дата и время
              </Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                Длительность (минут)
              </Label>
              <Input
                type="number"
                placeholder="90"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          {/* Join URL */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-gray-400" />
              Ссылка для участников
            </Label>
            <Input
              placeholder="https://zoom.us/j/... или другая ссылка"
              value={joinUrl}
              onChange={(e) => setJoinUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Zoom, VideoSDK, VideoConf, Google Meet — любая ссылка. Участники увидят её после записи.
            </p>
          </div>

          {/* Recording URL */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-gray-400" />
              Запись (после эфира)
            </Label>
            <Input
              placeholder="Ссылка на запись — заполняется после вебинара"
              value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
            />
          </div>

          <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить
          </Button>
        </CardContent>
      </Card>

      {/* Attendees info */}
      {webinar && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Участники</p>
              <p className="text-sm text-muted-foreground">
                Студенты, которые записались, получат ссылку и сертификат после посещения
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto shrink-0"
              onClick={() => router.push(`/author/students`)}
            >
              Смотреть
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
