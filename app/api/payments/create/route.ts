import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateRobokassaUrl } from "@/lib/payments/robokassa";
import { initTBankPayment } from "@/lib/payments/tbank";
import { createBank131Payment } from "@/lib/payments/bank131";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { courseId, provider = "ROBOKASSA" } = await req.json();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.price) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  // Create pending payment record
  const payment = await prisma.payment.create({
    data: {
      userId: session.user.id,
      courseId,
      amount: course.price,
      provider: provider as "ROBOKASSA" | "TBANK" | "BANK131",
      status: "PENDING",
      description: `Оплата курса: ${course.title}`,
    },
  });

  let paymentUrl: string | null = null;

  if (provider === "ROBOKASSA") {
    paymentUrl = generateRobokassaUrl({
      invoiceId: payment.id,
      amount: course.price,
      description: `Курс: ${course.title}`,
      email: session.user.email ?? undefined,
    });
  } else if (provider === "TBANK") {
    const result = await initTBankPayment({
      orderId: payment.id,
      amount: Math.round(course.price * 100), // to kopecks
      description: `Курс: ${course.title}`,
      email: session.user.email ?? undefined,
    });
    if (result) {
      paymentUrl = result.paymentUrl;
      await prisma.payment.update({
        where: { id: payment.id },
        data: { externalId: result.paymentId },
      });
    }
  } else if (provider === "BANK131") {
    const result = await createBank131Payment({
      orderId: payment.id,
      amount: course.price,
      description: `Курс: ${course.title}`,
    });
    if (result) {
      paymentUrl = result.paymentUrl;
      await prisma.payment.update({
        where: { id: payment.id },
        data: { externalId: result.paymentId },
      });
    }
  }

  if (!paymentUrl) {
    return NextResponse.json({ message: "Payment init failed" }, { status: 500 });
  }

  return NextResponse.json({ paymentUrl, paymentId: payment.id });
}
