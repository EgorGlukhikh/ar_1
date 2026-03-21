import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { randomUUID } from "crypto";

// ─── S3 ───────────────────────────────────────────────────────────────────────
async function uploadToS3(buffer: Buffer, key: string, contentType: string) {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const endpoint = process.env.S3_ENDPOINT!;
  const s3 = new S3Client({
    endpoint,
    region: process.env.S3_REGION ?? "ru-central1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read" as never,
    })
  );
  return `${endpoint.replace(/\/$/, "")}/${process.env.S3_BUCKET_NAME}/${key}`;
}

// ─── Cloudinary ───────────────────────────────────────────────────────────────
async function uploadToCloudinary(buffer: Buffer, contentType: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET!;

  const form = new FormData();
  form.append("file", new Blob([buffer], { type: contentType }));
  form.append("upload_preset", preset);
  form.append("folder", "ar-academy/covers");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Cloudinary error");
  return data.secure_url as string;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Файл не передан" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const buffer = Buffer.from(await file.arrayBuffer());

  // Try S3 first
  const hasS3 =
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY;

  if (hasS3) {
    try {
      const key = `covers/${randomUUID()}.${ext}`;
      const url = await uploadToS3(buffer, key, file.type);
      return NextResponse.json({ url });
    } catch (e) {
      console.error("[upload] S3 failed:", e);
    }
  }

  // Try Cloudinary
  const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET;

  if (hasCloudinary) {
    try {
      const url = await uploadToCloudinary(buffer, file.type);
      return NextResponse.json({ url });
    } catch (e) {
      console.error("[upload] Cloudinary failed:", e);
      return NextResponse.json({ error: "Ошибка загрузки в Cloudinary" }, { status: 500 });
    }
  }

  return NextResponse.json(
    {
      error:
        "Хранилище не настроено. Добавьте переменные S3_ENDPOINT/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY или CLOUDINARY_CLOUD_NAME/CLOUDINARY_UPLOAD_PRESET в Railway → Variables.",
    },
    { status: 503 }
  );
}
