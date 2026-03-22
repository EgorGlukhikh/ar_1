import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const ALLOWED_EVENTS = ["play", "pause", "seek", "ended", "visibility_hidden", "heartbeat"] as const;
type EventType = typeof ALLOWED_EVENTS[number];

interface EventPayload {
  lessonId: string;
  event: EventType;
  second?: number;
  percent?: number;
  payload?: Record<string, unknown>;
}

// POST /api/analytics/events — batch or single event
// Body: EventPayload | EventPayload[]
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await req.json();
  const events: EventPayload[] = Array.isArray(body) ? body : [body];

  // Validate + filter
  const valid = events.filter(
    (e) => e.lessonId && ALLOWED_EVENTS.includes(e.event as EventType)
  );

  if (!valid.length) {
    return NextResponse.json({ ok: false, error: "No valid events" }, { status: 400 });
  }

  await prisma.lessonEvent.createMany({
    data: valid.map((e) => ({
      userId: session.user.id,
      lessonId: e.lessonId,
      event: e.event,
      second: e.second ?? null,
      percent: e.percent ?? null,
      payload: e.payload ? (e.payload as Prisma.InputJsonValue) : Prisma.JsonNull,
    })),
    skipDuplicates: false,
  });

  return NextResponse.json({ ok: true });
}
