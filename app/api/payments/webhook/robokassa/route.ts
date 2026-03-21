import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRobokassaCallback } from "@/lib/payments/robokassa";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const outSum = body.get("OutSum") as string;
  const invId = body.get("InvId") as string;
  const signatureValue = body.get("SignatureValue") as string;

  if (!verifyRobokassaCallback({ outSum, invId, signatureValue })) {
    return new NextResponse("bad sign", { status: 400 });
  }

  const payment = await prisma.payment.findUnique({ where: { id: invId } });
  if (!payment) return new NextResponse("not found", { status: 404 });

  if (payment.status !== "PAID") {
    await prisma.payment.update({
      where: { id: invId },
      data: { status: "PAID" },
    });

    // Enroll user in course
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: payment.userId, courseId: payment.courseId },
      },
      update: {},
      create: { userId: payment.userId, courseId: payment.courseId },
    });
  }

  return new NextResponse(`OK${invId}`);
}
