import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const PREVIEW_COOKIE = "admin_preview_role";
const ALLOWED_ROLES = ["STUDENT", "AUTHOR", "CURATOR", "ADMIN"] as const;
type PreviewRole = typeof ALLOWED_ROLES[number];

// POST /api/admin/preview-role  { role: "STUDENT" | "AUTHOR" | "CURATOR" | null }
// Sets a cookie that the layout reads to render UI as a different role
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { role } = await req.json() as { role: PreviewRole | null };

  const res = NextResponse.json({ ok: true, role });

  if (!role) {
    // Clear preview
    res.cookies.delete(PREVIEW_COOKIE);
  } else if (ALLOWED_ROLES.includes(role)) {
    res.cookies.set(PREVIEW_COOKIE, role, {
      httpOnly: false, // needs to be readable by client for banner
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });
  }

  return res;
}

export async function DELETE() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(PREVIEW_COOKIE);
  return res;
}
