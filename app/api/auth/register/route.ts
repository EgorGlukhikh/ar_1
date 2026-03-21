import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Некорректные данные" }, { status: 400 });
    }
    console.error("[REGISTER]", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}
