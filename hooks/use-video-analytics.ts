"use client";

import { useEffect, useRef, useCallback } from "react";

interface Options {
  lessonId: string;
  enabled?: boolean;
}

// Ref: Wistia heatmap approach — track play/pause/seek/ended/heartbeat/visibility_hidden
// Heartbeat every 10s while playing to reconstruct watch timeline
export function useVideoAnalytics({ lessonId, enabled = true }: Options) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queueRef = useRef<object[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (!enabled || !queueRef.current.length) return;
    const batch = [...queueRef.current];
    queueRef.current = [];
    try {
      await fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
        keepalive: true, // survives page unload
      });
    } catch {
      // analytics are non-critical — swallow errors
    }
  }, [enabled]);

  const push = useCallback((
    event: string,
    second?: number,
    percent?: number,
    extra?: object
  ) => {
    if (!enabled) return;
    queueRef.current.push({ lessonId, event, second, percent, payload: extra });
    // debounce flush 1s (batch nearby events)
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(flush, 1000);
  }, [lessonId, enabled, flush]);

  const getPos = (v: HTMLVideoElement) => ({
    second: Math.round(v.currentTime),
    percent: v.duration > 0 ? Math.round((v.currentTime / v.duration) * 100) : undefined,
  });

  // Attach to a <video> element
  const attachTo = useCallback((video: HTMLVideoElement | null) => {
    if (!video || !enabled) return;
    videoRef.current = video;

    const onPlay = () => { const p = getPos(video); push("play", p.second, p.percent); };
    const onPause = () => { const p = getPos(video); push("pause", p.second, p.percent); };
    const onSeeked = () => { push("seek", Math.round(video.currentTime)); };
    const onEnded = () => { push("ended", Math.round(video.duration), 100); flush(); };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("ended", onEnded);
    };
  }, [enabled, push, flush]);

  // Heartbeat every 10s while playing
  useEffect(() => {
    if (!enabled) return;
    heartbeatRef.current = setInterval(() => {
      const v = videoRef.current;
      if (v && !v.paused && !v.ended) {
        const p = getPos(v);
        push("heartbeat", p.second, p.percent);
      }
    }, 10_000);
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [enabled, push]);

  // Track visibility_hidden — best proxy for "closed tab / switched app"
  // Reference: MDN Page Visibility API
  useEffect(() => {
    if (!enabled) return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        const v = videoRef.current;
        if (v) {
          const p = getPos(v);
          push("visibility_hidden", p.second, p.percent);
        }
        flush(); // flush immediately on hide — keepalive ensures delivery
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled, push, flush]);

  // Also flush on beforeunload (desktop close)
  useEffect(() => {
    if (!enabled) return;
    const onUnload = () => flush();
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [enabled, flush]);

  return { attachTo, push };
}
