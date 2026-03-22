"use client";

import { useEffect, useState } from "react";

interface DropOffBucket {
  pct: number;
  users: number;
}

interface DropOffBar {
  from: number;
  to: number;
  count: number;
}

interface AnalyticsData {
  totalViewers: number;
  avgWatchPercent: number;
  dropOffBuckets: DropOffBucket[];
  dropOffBars: DropOffBar[];
}

export function LessonDropoffChart({ lessonId }: { lessonId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/lessons/${lessonId}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return <div className="mt-2 h-12 animate-pulse rounded bg-muted" />;
  }

  if (!data || data.totalViewers === 0) return null;

  // Reach curve: how many % of initial viewers reached each 10% point
  const maxViewers = data.dropOffBuckets[0]?.users ?? 1;
  const reachCurve = data.dropOffBuckets.map((b) => ({
    ...b,
    ratio: maxViewers > 0 ? (b.users / maxViewers) * 100 : 0,
  }));

  // Drop-off histogram — where users paused/left
  const maxBar = Math.max(...data.dropOffBars.map((b) => b.count), 1);

  return (
    <div className="mt-3 space-y-3">
      {/* Reach curve — inspired by LearnWorlds video analytics */}
      <div>
        <p className="mb-1 text-xs text-muted-foreground">
          Кривая удержания (% зрителей дошедших до отметки)
        </p>
        <div className="flex h-10 items-end gap-0.5">
          {reachCurve.map((b) => (
            <div key={b.pct} className="group relative flex-1">
              <div
                className="w-full rounded-t bg-purple-400 transition-all group-hover:bg-purple-600"
                style={{ height: `${b.ratio}%` }}
              />
              <div className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-white group-hover:block whitespace-nowrap">
                {b.pct}%: {b.users} зр.
              </div>
            </div>
          ))}
        </div>
        <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Drop-off histogram — where people left */}
      {data.dropOffBars.some((b) => b.count > 0) && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">
            Где остановили / закрыли страницу
          </p>
          <div className="flex h-8 items-end gap-0.5">
            {data.dropOffBars.map((b, i) => (
              <div key={i} className="group relative flex-1">
                <div
                  className="w-full rounded-t bg-red-300 transition-all group-hover:bg-red-500"
                  style={{ height: `${(b.count / maxBar) * 100}%` }}
                />
                {b.count > 0 && (
                  <div className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-white group-hover:block whitespace-nowrap">
                    {b.from}–{b.to}с: {b.count}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
            <span>начало</span>
            <span>конец</span>
          </div>
        </div>
      )}
    </div>
  );
}
