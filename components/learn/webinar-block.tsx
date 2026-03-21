"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Monitor,
  Users,
  Clock,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WebinarInfo {
  token: string;
  roomId: string;
  isHost: boolean;
  status: "SCHEDULED" | "LIVE" | "ENDED";
  scheduledAt: string | null;
  recordingUrl: string | null;
}

interface WebinarBlockProps {
  lessonId: string;
  lessonTitle: string;
}

// ─── Inner room component using useMeeting hook ───────────────────────────────

function WebinarRoom({
  isHost,
  onLeave,
}: {
  isHost: boolean;
  onLeave: () => void;
}) {
  // Dynamically load the hook to avoid SSR issues
  const [controls, setControls] = useState<{
    muteMic: () => void;
    unmuteMic: () => void;
    enableWebcam: () => void;
    disableWebcam: () => void;
    enableScreenShare: () => void;
    leave: () => void;
    participants: Map<string, unknown>;
  } | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    // useMeeting can only be called inside MeetingProvider,
    // so we get controls via event-based bridge
    const handler = (e: CustomEvent) => setControls(e.detail);
    window.addEventListener("webinar:controls", handler as EventListener);
    return () => window.removeEventListener("webinar:controls", handler as EventListener);
  }, []);

  const toggleMic = () => {
    if (!controls) return;
    micOn ? controls.muteMic() : controls.unmuteMic();
    setMicOn((v) => !v);
  };

  const toggleCam = () => {
    if (!controls) return;
    camOn ? controls.disableWebcam() : controls.enableWebcam();
    setCamOn((v) => !v);
  };

  return (
    <div className="space-y-4">
      <div
        className="relative bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center"
        style={{ minHeight: 400 }}
      >
        <div id="webinar-participant-grid" className="w-full h-full" />
        <p className="absolute text-white/40 text-sm">
          Видеопоток активен
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={toggleMic}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            micOn ? "bg-gray-100 hover:bg-gray-200" : "bg-red-500 text-white hover:bg-red-600"
          )}
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>

        <button
          onClick={toggleCam}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            camOn ? "bg-gray-100 hover:bg-gray-200" : "bg-red-500 text-white hover:bg-red-600"
          )}
        >
          {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>

        {isHost && (
          <button
            className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            onClick={() => controls?.enableScreenShare?.()}
          >
            <Monitor className="h-5 w-5" />
          </button>
        )}

        <button
          onClick={onLeave}
          className="w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {isHost ? "Нажмите красную кнопку, чтобы завершить вебинар" : "Нажмите красную кнопку, чтобы выйти"}
      </p>
    </div>
  );
}

// ─── Main block ───────────────────────────────────────────────────────────────

export function WebinarBlock({ lessonId, lessonTitle }: WebinarBlockProps) {
  const [info, setInfo] = useState<WebinarInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [participantCount, setParticipantCount] = useState(1);

  useEffect(() => {
    fetch(`/api/webinars/${lessonId}/token`)
      .then((r) => r.json())
      .then((data) => { if (!data.error) setInfo(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId]);

  const joinMeeting = useCallback(async () => {
    if (!info) return;
    try {
      const sdk = await import("@videosdk.live/react-sdk");
      const { MeetingProvider, useMeeting } = sdk;

      if (!MeetingProvider || !useMeeting) throw new Error("SDK not loaded");

      // Update status to LIVE if host
      if (info.isHost) {
        await fetch(`/api/webinars/${lessonId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "LIVE" }),
        });
        setInfo((prev) => prev ? { ...prev, status: "LIVE" } : prev);
      }

      setJoined(true);
      toast.success("Подключено к вебинару");
    } catch {
      toast.error("Не удалось подключиться. Проверьте настройки вебинара.");
    }
  }, [info, lessonId]);

  const leaveMeeting = useCallback(async () => {
    setJoined(false);

    if (info?.isHost) {
      const recordingUrl = window.prompt("Вставьте ссылку на запись (необязательно):");
      await fetch(`/api/webinars/${lessonId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ENDED",
          ...(recordingUrl ? { recordingUrl } : {}),
        }),
      });
      setInfo((prev) => prev ? { ...prev, status: "ENDED" } : prev);
    }
  }, [info, lessonId]);

  if (loading) {
    return <div className="rounded-2xl border bg-white p-8 animate-pulse h-32" />;
  }

  if (!info) {
    return (
      <div className="rounded-2xl border bg-purple-50 p-6 flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-purple-800">Вебинар не настроен</p>
          <p className="text-sm text-purple-600 mt-1">Автор курса ещё не создал комнату.</p>
        </div>
      </div>
    );
  }

  // Show recording after end
  if (info.status === "ENDED" && !joined) {
    return (
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="bg-purple-50 border-b border-purple-100 px-6 py-4 flex items-center gap-3">
          <PlayCircle className="h-5 w-5 text-purple-500 shrink-0" />
          <div>
            <h2 className="font-semibold text-lg">{lessonTitle}</h2>
            <Badge variant="secondary" className="text-xs">Вебинар завершён</Badge>
          </div>
        </div>
        <div className="p-6">
          {info.recordingUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              <iframe src={info.recordingUrl} className="absolute inset-0 w-full h-full" allowFullScreen />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Запись появится здесь после обработки.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="bg-purple-50 border-b border-purple-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="h-5 w-5 text-purple-500 shrink-0" />
          <div>
            <h2 className="font-semibold text-lg">{lessonTitle}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              {info.status === "LIVE" ? (
                <Badge className="bg-red-500 text-white text-xs">🔴 LIVE</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Запланирован</Badge>
              )}
              {info.scheduledAt && info.status === "SCHEDULED" && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(info.scheduledAt).toLocaleString("ru-RU", {
                    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        {joined && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> {participantCount}
          </span>
        )}
      </div>

      <div className="p-6">
        {!joined ? (
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
              <Video className="h-8 w-8 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {info.status === "LIVE" ? "Вебинар идёт прямо сейчас!" : "Вебинар скоро начнётся"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {info.isHost ? "Вы — ведущий." : "Войдите, когда будете готовы."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMicOn((v) => !v)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all",
                  micOn ? "bg-white border-gray-200" : "bg-red-50 border-red-200 text-red-600"
                )}
              >
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                {micOn ? "Микрофон вкл." : "Выкл."}
              </button>
              <button
                onClick={() => setCamOn((v) => !v)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all",
                  camOn ? "bg-white border-gray-200" : "bg-red-50 border-red-200 text-red-600"
                )}
              >
                {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                {camOn ? "Камера вкл." : "Выкл."}
              </button>
            </div>

            <Button
              onClick={joinMeeting}
              className="h-12 px-8 text-base"
              disabled={info.status === "SCHEDULED" && !info.isHost}
            >
              {info.isHost ? "Начать вебинар" : "Войти в комнату"}
            </Button>

            {info.status === "SCHEDULED" && !info.isHost && (
              <p className="text-xs text-muted-foreground">
                Станет активна, когда ведущий начнёт трансляцию
              </p>
            )}
          </div>
        ) : (
          <WebinarRoom isHost={info.isHost} onLeave={leaveMeeting} />
        )}
      </div>
    </div>
  );
}
