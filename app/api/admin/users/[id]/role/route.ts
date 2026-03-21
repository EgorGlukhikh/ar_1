import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 });
  }

  const { id } = await params;
  const { role } = await req.json();

  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });

  return NextResponse.json(user);
}
