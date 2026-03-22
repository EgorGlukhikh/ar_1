-- CreateTable: LessonEvent for student behavior analytics
CREATE TABLE "LessonEvent" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "lessonId"  TEXT NOT NULL,
    "event"     TEXT NOT NULL,
    "second"    DOUBLE PRECISION,
    "percent"   DOUBLE PRECISION,
    "payload"   JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LessonEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LessonEvent_lessonId_event_idx" ON "LessonEvent"("lessonId", "event");
CREATE INDEX "LessonEvent_userId_lessonId_idx" ON "LessonEvent"("userId", "lessonId");

ALTER TABLE "LessonEvent" ADD CONSTRAINT "LessonEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonEvent" ADD CONSTRAINT "LessonEvent_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
