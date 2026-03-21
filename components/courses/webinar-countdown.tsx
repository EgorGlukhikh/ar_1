"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Props {
  scheduledAt: string;
}

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export function WebinarCountdown({ scheduledAt }: Props) {
  const target = new Date(scheduledAt);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!timeLeft) return null;

  return (
    <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-purple-700">
        <Clock className="h-3.5 w-3.5" />
        До начала вебинара
      </p>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { value: timeLeft.days, label: "дн" },
          { value: timeLeft.hours, label: "ч" },
          { value: timeLeft.minutes, label: "мин" },
          { value: timeLeft.seconds, label: "сек" },
        ].map(({ value, label }) => (
          <div key={label}>
            <div className="text-2xl font-bold tabular-nums text-purple-700">
              {String(value).padStart(2, "0")}
            </div>
            <div className="text-xs text-purple-500">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
