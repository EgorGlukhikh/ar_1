import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/users/:id/balance  { amount: number }
// Adds balance for a user (internal wallet)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { amount } = await req.json();

  if (typeof amount !== "number" || isNaN(amount) || amount === 0) {
    return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const newBalance = Math.max(0, user.balance + amount);
  const updated = await prisma.user.update({
    where: { id },
    data: { balance: newBalance },
    select: { id: true, balance: true },
  });

  return NextResponse.json({ balance: updated.balance });
}
