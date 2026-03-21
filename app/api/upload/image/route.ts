import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

function getS3() {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    endpoint,
    region: process.env.S3_REGION ?? "ru-central1",
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const s3 = getS3();
  if (!s3) {
    return NextResponse.json(
      { error: "S3 не настроен. Добавьте S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY в переменные окружения." },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Файл не передан" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `covers/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read" as never,
    })
  );

  const endpoint = process.env.S3_ENDPOINT!.replace(/\/$/, "");
  const bucket = process.env.S3_BUCKET_NAME;
  const url = `${endpoint}/${bucket}/${key}`;

  return NextResponse.json({ url });
}
