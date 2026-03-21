import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { CertificateDocument } from "@/lib/certificate-pdf";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReactElement = any;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      course: { select: { title: true } },
    },
  });

  if (!certificate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only owner or admin can download
  if (certificate.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({}, { status: 403 });
  }

  const element: AnyReactElement = createElement(CertificateDocument, {
    studentName: certificate.user.name ?? "Студент",
    courseName: certificate.course.title,
    issuedAt: certificate.issuedAt,
    certificateNumber: certificate.number,
  });
  const buffer = await renderToBuffer(element);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-${certificate.number}.pdf"`,
    },
  });
}
