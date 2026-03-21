"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Clock,
  ExternalLink,
  ArrowLeft,
  Calendar,
  Award,
  Play,
} from "lucide-react";
import { WebinarCountdown } from "./webinar-countdown";

type WebinarStatus = "SCHEDULED" | "LIVE" | "ENDED";

interface WebinarData {
  id: string;
  scheduledAt: string;
  duration: number | null;
  joinUrl: string | null;
  recordingUrl: string | null;
  status: WebinarStatus;
}

interface Props {
  courseId: string;
  courseTitle: string;
  authorName: string;
  webinar: WebinarData;
  userId: string;
  slug: string;
}

export function WebinarRoomClient({
  courseId,
  courseTitle,
  authorName,
  webinar: initialWebinar,
  userId,
  slug,
}: Props) {
  const [webinar, setWebinar] = useState(initialWebinar);
  const [attended, setAttended] = useState(false);

  // Poll for status changes every 30s
  useEffect(() => {
    const id = setInterval(async () => {
      const res = await fetch(`/api/webinars/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) setWebinar((w) => ({ ...w, ...data }));
      }
    }, 30000);
    return () => clearInterval(id);
  }, [courseId]);

  const handleJoin = async () => {
    if (!webinar.joinUrl) return;
    window.open(webinar.joinUrl, "_blank", "noopener,noreferrer");

    if (!attended) {
      setAttended(true);
      await fetch(`/api/webinars/${courseId}/attend`, { method: "POST" }).catch(() => {});
    }
  };

  const isScheduled = webinar.status === "SCHEDULED";
  const isLive = webinar.status === "LIVE";
  const isEnded = webinar.status === "ENDED";

  const scheduledDate = new Date(webinar.scheduledAt);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #7C5CFC 0%, #9B5CF6 100%)" }}>
        <div className="container mx-auto px-4 py-6">
          <Link
            href={`/courses/${slug}`}
            className="mb-4 flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            К странице вебинара
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{courseTitle}</h1>
              <p className="text-sm text-white/70">Ведёт: {authorName}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isLive && (
                <Badge className="animate-pulse bg-red-500 text-white">🔴 LIVE</Badge>
              )}
              {isScheduled && (
                <Badge className="bg-white/20 text-white">Запланирован</Badge>
              )}
              {isEnded && (
                <Badge className="bg-white/20 text-white">Завершён</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-10">
        {/* SCHEDULED state */}
        {isScheduled && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">Вебинар скоро начнётся</h2>
              <p className="mb-1 text-sm text-muted-foreground">
                {scheduledDate.toLocaleDateString("ru-RU", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
              <p className="mb-6 text-2xl font-bold text-gray-900">
                {scheduledDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                {webinar.duration ? <span className="ml-2 text-base font-normal text-muted-foreground">· {webinar.duration} мин</span> : null}
              </p>

              <WebinarCountdown scheduledAt={webinar.scheduledAt} />

              {webinar.joinUrl && (
                <div className="mt-6">
                  <Button
                    size="lg"
                    onClick={handleJoin}
                    className="gap-2 text-white"
                    style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Перейти к трансляции
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">Ссылка откроется в новой вкладке</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* LIVE state */}
        {isLive && (
          <Card className="overflow-hidden border-2 border-red-200">
            <div className="bg-red-50 px-6 py-3 text-center">
              <span className="text-sm font-semibold text-red-600">🔴 Вебинар идёт прямо сейчас!</span>
            </div>
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <Video className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Эфир идёт!</h2>
              {webinar.joinUrl ? (
                <>
                  <Button
                    size="lg"
                    onClick={handleJoin}
                    className="gap-2 bg-red-500 text-white hover:bg-red-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Присоединиться сейчас
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    После нажатия ваше посещение будет зафиксировано
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Ссылка появится в ближайшее время...</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* ENDED state */}
        {isEnded && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Video className="h-8 w-8 text-gray-500" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">Вебинар завершён</h2>

              {webinar.recordingUrl ? (
                <>
                  <p className="mb-6 text-sm text-muted-foreground">Запись доступна для просмотра</p>
                  <Button
                    size="lg"
                    onClick={() => window.open(webinar.recordingUrl!, "_blank", "noopener,noreferrer")}
                    className="gap-2 text-white"
                    style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
                  >
                    <Play className="h-4 w-4" />
                    Смотреть запись
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Запись скоро появится здесь
                </p>
              )}

              <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-yellow-800">
                  <Award className="h-4 w-4" />
                  Сертификат участника
                </div>
                <p className="mt-1 text-xs text-yellow-700">
                  Если вы посетили вебинар — ваш сертификат уже в профиле
                </p>
                <Link href="/profile" className="mt-2 inline-block text-xs font-medium text-yellow-800 underline">
                  Перейти в профиль →
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info footer */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {scheduledDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
            {" · "}
            {scheduledDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
          </span>
          {webinar.duration && (
            <span>{webinar.duration} минут</span>
          )}
        </div>
      </div>
    </div>
  );
}
