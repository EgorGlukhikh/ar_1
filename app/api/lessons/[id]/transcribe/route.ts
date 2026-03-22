import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

// Groq Whisper — free tier, whisper-large-v3, 2h audio/day
// API key: GROQ_API_KEY in .env  (console.groq.com — free)
// Ref: https://console.groq.com/docs/speech-text
// Supports: MP4, WebM, MP3, WAV, OGG, FLAC — max 25MB

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

// Convert Groq verbose_json to WebVTT
function toVTT(segments: Array<{ start: number; end: number; text: string }>): string {
  const pad = (n: number) => {
    const h = Math.floor(n / 3600);
    const m = Math.floor((n % 3600) / 60);
    const s = Math.floor(n % 60);
    const ms = Math.round((n % 1) * 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
  };

  const cues = segments
    .map((seg, i) => `${i + 1}\n${pad(seg.start)} --> ${pad(seg.end)}\n${seg.text.trim()}`)
    .join("\n\n");

  return `WEBVTT\n\n${cues}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user.role !== "AUTHOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id: lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "GROQ_API_KEY не настроен. Добавьте его в .env (бесплатно на console.groq.com)" },
      { status: 503 }
    );
  }

  // Get video source
  // For Mux: use the static MP4 rendition URL
  // For direct URL: use as-is
  // For YouTube/Rutube: not supported (can't download)
  const videoUrl = lesson.muxPlaybackId
    ? `https://stream.mux.com/${lesson.muxPlaybackId}/low.mp4`
    : lesson.videoUrl;

  if (!videoUrl) {
    return NextResponse.json({ message: "У урока нет видео" }, { status: 400 });
  }

  if (lesson.videoType === "YOUTUBE" || lesson.videoType === "RUTUBE" || lesson.videoType === "VIMEO" || lesson.videoType === "YANDEX_DISK") {
    return NextResponse.json(
      { message: `Субтитры через Whisper недоступны для ${lesson.videoType}. Используйте прямую загрузку видео.` },
      { status: 400 }
    );
  }

  // Download video (up to 25 MB)
  let videoRes: Response;
  try {
    videoRes = await fetch(videoUrl, { signal: AbortSignal.timeout(60_000) });
    if (!videoRes.ok) throw new Error(`HTTP ${videoRes.status}`);
  } catch (e) {
    return NextResponse.json({ message: `Не удалось скачать видео: ${e}` }, { status: 502 });
  }

  const contentLength = Number(videoRes.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BYTES) {
    return NextResponse.json(
      { message: `Файл ${Math.round(contentLength / 1024 / 1024)} МБ превышает лимит 25 МБ Groq Whisper. Сожмите видео или используйте более короткий ролик.` },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await videoRes.arrayBuffer());
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json(
      { message: `Файл ${Math.round(buffer.length / 1024 / 1024)} МБ превышает лимит 25 МБ.` },
      { status: 413 }
    );
  }

  // Detect file extension from URL or Content-Type
  const ct = videoRes.headers.get("content-type") ?? "";
  const ext = ct.includes("webm") ? "webm"
    : ct.includes("ogg") ? "ogg"
    : ct.includes("mp3") || ct.includes("mpeg") ? "mp3"
    : ct.includes("wav") ? "wav"
    : "mp4";

  // Send to Groq Whisper
  const groq = new Groq({ apiKey });
  let transcription: Awaited<ReturnType<typeof groq.audio.transcriptions.create>>;
  try {
    const file = new File([buffer], `lesson.${ext}`, { type: ct || `video/${ext}` });
    transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3",
      response_format: "verbose_json",   // gives us segments with timestamps
      language: "ru",                    // hint Russian; Whisper auto-detects if wrong
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ message: `Groq Whisper error: ${msg}` }, { status: 502 });
  }

  // Build VTT
  const segments = (transcription as unknown as { segments: Array<{ start: number; end: number; text: string }> }).segments ?? [];
  const vtt = segments.length > 0
    ? toVTT(segments)
    : `WEBVTT\n\n1\n00:00:00.000 --> 00:00:10.000\n${transcription.text}`;

  // Save to lesson
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { subtitles: vtt },
  });

  return NextResponse.json({ ok: true, vtt, segmentCount: segments.length });
}

// DELETE — clear subtitles
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user.role !== "AUTHOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.lesson.update({ where: { id }, data: { subtitles: null } });
  return NextResponse.json({ ok: true });
}
