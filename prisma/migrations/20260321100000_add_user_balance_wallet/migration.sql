-- Add balance field to User for internal wallet system
ALTER TABLE "User" ADD COLUMN "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Add CourseType enum if not exists (webinar restructure)
DO $$ BEGIN
  CREATE TYPE "CourseType" AS ENUM ('COURSE', 'WEBINAR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add type column to Course if not exists
DO $$ BEGIN
  ALTER TABLE "Course" ADD COLUMN "type" "CourseType" NOT NULL DEFAULT 'COURSE';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Create CourseWebinar table if not exists
CREATE TABLE IF NOT EXISTS "CourseWebinar" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "joinUrl" TEXT,
    "recordingUrl" TEXT,
    "status" "WebinarStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseWebinar_pkey" PRIMARY KEY ("id")
);

-- Create unique index on CourseWebinar.courseId if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "CourseWebinar_courseId_key" ON "CourseWebinar"("courseId");

-- Add FK on CourseWebinar if not exists
DO $$ BEGIN
  ALTER TABLE "CourseWebinar" ADD CONSTRAINT "CourseWebinar_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create WebinarAttendance table if not exists
CREATE TABLE IF NOT EXISTS "WebinarAttendance" (
    "id" TEXT NOT NULL,
    "webinarId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebinarAttendance_pkey" PRIMARY KEY ("id")
);

-- Create unique index on WebinarAttendance if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "WebinarAttendance_webinarId_userId_key"
  ON "WebinarAttendance"("webinarId", "userId");

-- Add FKs on WebinarAttendance if not exist
DO $$ BEGIN
  ALTER TABLE "WebinarAttendance" ADD CONSTRAINT "WebinarAttendance_webinarId_fkey"
    FOREIGN KEY ("webinarId") REFERENCES "CourseWebinar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "WebinarAttendance" ADD CONSTRAINT "WebinarAttendance_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add webinarAttendances relation column is implicit via FK above
