import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Routes that don't require auth
const PUBLIC_ROUTES = ["/", "/landing", "/courses", "/login", "/register"];
// Routes that require specific roles
const ADMIN_ROUTES = ["/admin"];
const AUTHOR_ROUTES = ["/author"];
const CURATOR_ROUTES = ["/curator"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public routes and API routes
  if (
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/public/")
  ) {
    return NextResponse.next();
  }

  // Not authenticated → redirect to login
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user?.role;

  // Admin routes — also allow when admin is in preview mode
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Author routes — allow if admin (for role preview)
  if (AUTHOR_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== "AUTHOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Curator routes — allow if admin (for role preview)
  if (CURATOR_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== "CURATOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  const res = NextResponse.next();

  // Set a client-readable cookie marking this as an admin session
  // Used by RolePreviewBanner to know whether to show itself
  if (role === "ADMIN") {
    res.cookies.set("is_admin_session", "1", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  } else {
    // Clear the cookie if not admin (e.g. after logout)
    res.cookies.delete("is_admin_session");
  }

  return res;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
