-- Add LessonBlock table for the new Course → Module → Lesson → Block hierarchy
CREATE TABLE IF NOT EXISTS "LessonBlock" (
  "id"            TEXT         NOT NULL,
  "lessonId"      TEXT         NOT NULL,
  "type"          TEXT         NOT NULL,
  "order"         INTEGER      NOT NULL DEFAULT 0,
  "title"         TEXT,
  "content"       TEXT,
  "videoUrl"      TEXT,
  "videoType"     TEXT,
  "muxAssetId"    TEXT,
  "muxPlaybackId" TEXT,
  "subtitles"     TEXT,
  "isPreview"     BOOLEAN      NOT NULL DEFAULT false,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LessonBlock_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "LessonBlock"
  ADD CONSTRAINT "LessonBlock_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "LessonBlock_lessonId_idx" ON "LessonBlock"("lessonId");
