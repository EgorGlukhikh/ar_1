"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ExternalLink, CheckCircle2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const BOT_URL = "https://max.ru/id1800004221_3_bot";

export function MaxBotBanner({ userId }: { userId: string }) {
  const [step, setStep] = useState<"idle" | "waiting" | "done">("idle");
  const [dismissed, setDismissed] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/profile/max");
        if (!res.ok) return;
        const data = await res.json();
        if (data.maxId) {
          stopPolling();
          setStep("done");
        }
      } catch {
        // ignore
      }
    }, 3000);
  }

  useEffect(() => () => stopPolling(), []);

  function handleConnect() {
    const deepLink = `${BOT_URL}?start=${encodeURIComponent(userId)}`;
    window.open(deepLink, "_blank", "noopener,noreferrer");
    setStep("waiting");
    startPolling();
  }

  if (dismissed) return null;

  if (step === "done") {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
        <p className="text-sm font-medium text-green-800">
          Бот подключён! Теперь вы будете получать уведомления о курсах,
          домашних заданиях и сертификатах.
        </p>
      </div>
    );
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-[#6E8AFA]/30 bg-gradient-to-r from-[#EEF1FF] to-white px-5 py-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded-md p-1 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6E8AFA]/15">
          <Bell className="h-5 w-5 text-[#6E8AFA]" />
        </div>

        <div className="flex-1 pr-6">
          <p className="font-semibold text-gray-900">
            Подключите бота Академии для уведомлений
          </p>
          <p className="mt-0.5 text-sm text-gray-500">
            Получайте в MAX сообщения о проверке домашних заданий, вебинарах и
            сертификатах.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {step === "idle" && (
              <Button
                size="sm"
                className="bg-[#6E8AFA] hover:bg-[#5a76f0]"
                onClick={handleConnect}
              >
                Подключить бота
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}

            {step === "waiting" && (
              <>
                <Button size="sm" disabled className="bg-[#6E8AFA]">
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Ожидаю подключения…
                </Button>
                <span className="text-xs text-gray-500">
                  Откройте бота в MAX и нажмите «Начать»
                </span>
                <button
                  onClick={() => {
                    stopPolling();
                    setStep("idle");
                  }}
                  className="text-xs text-gray-400 underline hover:text-gray-600"
                >
                  Отмена
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
