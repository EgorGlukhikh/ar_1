import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ message: "courseId required" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) {
    return NextResponse.json({ message: "Already enrolled" }, { status: 409 });
  }

  // Paid course — try wallet payment
  if (!course.isFree && course.price && course.price > 0) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    });

    if (!user || user.balance < course.price) {
      return NextResponse.json(
        { message: "Insufficient balance", balance: user?.balance ?? 0, price: course.price },
        { status: 402 }
      );
    }

    // Deduct balance, create payment record, enroll — all in one transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { balance: { decrement: course.price } },
      }),
      prisma.payment.create({
        data: {
          userId: session.user.id,
          courseId,
          amount: course.price,
          provider: "MANUAL",
          status: "PAID",
          description: `Оплата с баланса: ${course.title}`,
        },
      }),
      prisma.enrollment.create({
        data: { userId: session.user.id, courseId },
      }),
    ]);

    return NextResponse.json({ success: true, paidFromBalance: true }, { status: 201 });
  }

  // Free course — enroll directly
  await prisma.enrollment.create({
    data: { userId: session.user.id, courseId },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
