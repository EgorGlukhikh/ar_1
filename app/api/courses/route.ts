import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => translitMap[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

const translitMap: Record<string, string> = {
  а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",
  к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",
  х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "AUTHOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { title } = await req.json();
  if (!title) {
    return NextResponse.json({ message: "title required" }, { status: 400 });
  }

  let slug = slugify(title);
  // Ensure unique slug
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const course = await prisma.course.create({
    data: { title, slug, authorId: session.user.id },
  });

  return NextResponse.json(course, { status: 201 });
}
