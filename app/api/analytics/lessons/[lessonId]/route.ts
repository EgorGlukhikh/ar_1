import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/lessons/:lessonId
// Returns aggregated per-lesson analytics for admin/author
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "AUTHOR")) {
    return NextResponse.json({}, { status: 403 });
  }

  const { lessonId } = await params;

  // Raw events for this lesson
  const events = await prisma.lessonEvent.findMany({
    where: { lessonId },
    select: { userId: true, event: true, second: true, percent: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  if (!events.length) {
    return NextResponse.json({ totalViewers: 0, dropOffBuckets: [], avgWatchPercent: 0 });
  }

  // Unique viewers
  const viewers = new Set(events.map((e) => e.userId));
  const totalViewers = viewers.size;

  // Drop-off buckets: divide 0-100% into 10% buckets
  // For each bucket: how many users reached at least that point
  const BUCKETS = 10;
  const buckets = Array.from({ length: BUCKETS + 1 }, (_, i) => ({
    pct: i * 10,
    users: 0,
  }));

  // Per user: max percent reached (from heartbeat, pause, ended)
  const maxPerUser = new Map<string, number>();
  for (const e of events) {
    if (e.percent !== null && e.percent !== undefined) {
      const cur = maxPerUser.get(e.userId) ?? 0;
      if (e.percent > cur) maxPerUser.set(e.userId, e.percent);
    }
  }

  for (const maxPct of maxPerUser.values()) {
    for (const bucket of buckets) {
      if (maxPct >= bucket.pct) bucket.users++;
    }
  }

  const avgWatchPercent =
    maxPerUser.size > 0
      ? [...maxPerUser.values()].reduce((a, b) => a + b, 0) / maxPerUser.size
      : 0;

  // Last-pause distribution: where did users stop?
  const lastPausePerUser = new Map<string, number>();
  for (const e of events) {
    if ((e.event === "pause" || e.event === "visibility_hidden") && e.second !== null) {
      lastPausePerUser.set(e.userId, e.second);
    }
  }

  // Histogram: 20 bars across video duration
  const allSeconds = [...lastPausePerUser.values()];
  const maxSecond = allSeconds.length ? Math.max(...allSeconds) : 0;
  const BAR_COUNT = 20;
  const barSize = maxSecond > 0 ? maxSecond / BAR_COUNT : 60;
  const dropOffBars = Array.from({ length: BAR_COUNT }, (_, i) => ({
    from: Math.round(i * barSize),
    to: Math.round((i + 1) * barSize),
    count: 0,
  }));
  for (const s of allSeconds) {
    const idx = Math.min(Math.floor(s / barSize), BAR_COUNT - 1);
    dropOffBars[idx].count++;
  }

  return NextResponse.json({
    totalViewers,
    avgWatchPercent: Math.round(avgWatchPercent),
    dropOffBuckets: buckets,       // reach-curve: how many got to each 10% mark
    dropOffBars,                    // histogram: where paused/left
    rawEventCount: events.length,
  });
}
