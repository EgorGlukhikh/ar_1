"use client";

import { useState } from "react";
import { Bell, ExternalLink, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MaxBotBanner() {
  const [step, setStep] = useState<"idle" | "enter-id" | "saving" | "done">(
    "idle"
  );
  const [maxId, setMaxId] = useState("");
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function handleSave() {
    if (!maxId.trim()) {
      setError("Введите ваш MAX ID");
      return;
    }
    setStep("saving");
    setError("");
    try {
      const res = await fetch("/api/profile/max", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxId: maxId.trim() }),
      });
      if (!res.ok) throw new Error();
      setStep("done");
    } catch {
      setError("Не удалось сохранить. Попробуйте ещё раз.");
      setStep("enter-id");
    }
  }

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
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded-md p-1 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        {/* Icon */}
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

          {step === "idle" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="https://max.ru/id1800004221_3_bot"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="bg-[#6E8AFA] hover:bg-[#5a76f0]"
                  onClick={() => setStep("enter-id")}
                >
                  Подключить бота Академии
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          )}

          {(step === "enter-id" || step === "saving") && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-500">
                Откройте бота, напишите ему{" "}
                <span className="font-mono font-medium text-gray-700">
                  /start
                </span>{" "}
                — он ответит вашим MAX ID. Вставьте его ниже:
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Ваш MAX ID (например: 123456789)"
                  value={maxId}
                  onChange={(e) => setMaxId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="h-9 max-w-xs text-sm"
                  disabled={step === "saving"}
                />
                <Button
                  size="sm"
                  className="bg-[#6E8AFA] hover:bg-[#5a76f0]"
                  onClick={handleSave}
                  disabled={step === "saving"}
                >
                  {step === "saving" ? "Сохраняю..." : "Сохранить"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStep("idle")}
                  disabled={step === "saving"}
                >
                  Отмена
                </Button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
