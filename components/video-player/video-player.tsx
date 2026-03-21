"use client";

import { VideoType } from "@prisma/client";
import dynamic from "next/dynamic";

// Mux Player (lazy load to avoid SSR issues)
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

interface VideoPlayerProps {
  videoType: VideoType;
  videoUrl?: string | null;
  muxPlaybackId?: string | null;
  title?: string;
  onEnded?: () => void;
}

export function VideoPlayer({
  videoType,
  videoUrl,
  muxPlaybackId,
  title,
  onEnded,
}: VideoPlayerProps) {
  if (videoType === "UPLOAD" && muxPlaybackId) {
    return (
      <div className="overflow-hidden rounded-lg bg-black">
        <MuxPlayer
          playbackId={muxPlaybackId}
          metadata={{ video_title: title }}
          streamType="on-demand"
          onEnded={onEnded}
          style={{ width: "100%", aspectRatio: "16/9" }}
        />
      </div>
    );
  }

  if (videoType === "RUTUBE" && videoUrl) {
    const { id: rutubeId, privateKey } = getRutubeInfo(videoUrl);
    const embedSrc = privateKey
      ? `https://rutube.ru/play/embed/${rutubeId}/?p=${privateKey}`
      : `https://rutube.ru/play/embed/${rutubeId}/`;
    return (
      <div className="relative overflow-hidden rounded-lg bg-black" style={{ aspectRatio: "16/9" }}>
        <iframe
          src={embedSrc}
          className="absolute inset-0 h-full w-full"
          frameBorder="0"
          allow="clipboard-write; autoplay"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoType === "YANDEX_DISK" && videoUrl) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-black" style={{ aspectRatio: "16/9" }}>
        <iframe
          src={`https://disk.yandex.ru/i/${getYandexDiskId(videoUrl)}`}
          className="absolute inset-0 h-full w-full"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    );
  }

  if ((videoType === "YOUTUBE" || videoType === "VIMEO") && videoUrl) {
    const embedUrl = getYoutubeEmbedUrl(videoUrl) ?? videoUrl;
    return (
      <div className="relative overflow-hidden rounded-lg bg-black" style={{ aspectRatio: "16/9" }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 h-full w-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Fallback: direct video file
  if (videoUrl) {
    return (
      <div className="overflow-hidden rounded-lg bg-black">
        <video
          src={videoUrl}
          controls
          onContextMenu={(e) => e.preventDefault()}
          controlsList="nodownload"
          className="w-full"
          style={{ aspectRatio: "16/9" }}
          onEnded={onEnded}
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-900 text-gray-400">
      Видео недоступно
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRutubeInfo(url: string): { id: string; privateKey?: string } {
  // Private: https://rutube.ru/video/private/HASH/?p=KEY
  const privateMatch = url.match(/rutube\.ru\/video\/private\/([a-z0-9]+)/i);
  if (privateMatch) {
    const keyMatch = url.match(/[?&]p=([^&]+)/);
    return { id: privateMatch[1], privateKey: keyMatch?.[1] };
  }
  // Public: https://rutube.ru/video/HASH/
  const match = url.match(/rutube\.ru\/video\/([a-z0-9]+)/i);
  return { id: match?.[1] ?? url };
}

function getYandexDiskId(url: string): string {
  // Extract last segment from Yandex Disk share URL
  const match = url.match(/disk\.yandex\.ru\/i\/([^/?]+)/);
  return match?.[1] ?? url;
}

function getYoutubeEmbedUrl(url: string): string | null {
  const match =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/) ??
    url.match(/youtube\.com\/embed\/([^&\s]+)/);
  if (match?.[1]) {
    return `https://www.youtube.com/embed/${match[1]}?rel=0`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return null;
}
