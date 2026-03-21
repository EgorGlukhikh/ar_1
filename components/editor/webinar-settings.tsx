"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar, Video, ExternalLink, RefreshCw } from "lucide-react";

interface WebinarInfo {
  roomId: string | null;
  scheduledAt: string | null;
  status: "SCHEDULED" | "LIVE" | "ENDED";
  recordingUrl: string | null;
}

export function WebinarSettings({ lessonId }: { lessonId: string }) {
  const [webinar, setWebinar] = useState<WebinarInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => {
    fetch(`/api/webinars/${lessonId}/room`)
      .then((r) => r.json())
      .then((data) => setWebinar(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId]);

  const createRoom = async () => {
    if (!scheduledAt) {
      toast.error("Укажите дату и время вебинара");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`/api/webinars/${lessonId}/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWebinar(data);
      toast.success("Комната вебинара создана!");
    } catch {
      toast.error("Ошибка создания комнаты. Проверьте VIDEOSDK_API_KEY в .env");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-purple-50 p-4 animate-pulse h-24" />
    );
  }

  return (
    <div className="rounded-xl bg-purple-50 border border-purple-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Video className="h-4 w-4 text-purple-600" />
        <h3 className="font-semibold text-purple-900">Настройки вебинара</h3>
      </div>

      {webinar?.roomId ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs text-purple-600 font-medium mb-0.5">Комната создана</p>
              <code className="text-xs bg-white rounded px-2 py-0.5 border border-purple-200">
                {webinar.roomId}
              </code>
            </div>
            <Badge
              className={
                webinar.status === "LIVE"
                  ? "bg-red-500 text-white"
                  : webinar.status === "ENDED"
                  ? "bg-gray-500 text-white"
                  : "bg-green-500 text-white"
              }
            >
              {webinar.status === "LIVE" ? "🔴 LIVE" : webinar.status === "ENDED" ? "Завершён" : "Запланирован"}
            </Badge>
          </div>

          {webinar.scheduledAt && (
            <p className="text-sm text-purple-700 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(webinar.scheduledAt).toLocaleString("ru-RU", {
                day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          )}

          {webinar.recordingUrl && (
            <a
              href={webinar.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-purple-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Запись вебинара
            </a>
          )}

          {/* Reschedule */}
          <details className="text-xs">
            <summary className="cursor-pointer text-purple-600 hover:text-purple-800 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Перенести вебинар
            </summary>
            <div className="mt-2 flex gap-2">
              <input
                type="datetime-local"
                className="rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <Button size="sm" className="h-8 text-xs" onClick={createRoom} disabled={creating}>
                {creating ? "..." : "Сохранить"}
              </Button>
            </div>
          </details>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-purple-700">
            Создайте комнату для вебинара через VideoSDK.live. Студенты смогут присоединиться в назначенное время.
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs text-purple-800">Дата и время вебинара</Label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <Button
            onClick={createRoom}
            disabled={creating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {creating ? "Создаём комнату..." : "Создать комнату вебинара"}
          </Button>
          <p className="text-xs text-purple-500">
            Требуется: VIDEOSDK_API_KEY и VIDEOSDK_SECRET в .env
          </p>
        </div>
      )}
    </div>
  );
}
