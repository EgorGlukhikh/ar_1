"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  BarChart3,
  Eye,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Читаем cookie на клиенте
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

const ROLE_OPTIONS = [
  { value: "ADMIN",    label: "Админ",    emoji: "⚙️",  href: "/admin" },
  { value: "AUTHOR",   label: "Автор",    emoji: "✍️",  href: "/author/courses" },
  { value: "CURATOR",  label: "Куратор",  emoji: "🎓",  href: "/curator/submissions" },
  { value: "STUDENT",  label: "Студент",  emoji: "👤",  href: "/dashboard" },
];

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [previewRole, setPreviewRole] = useState<string | null>(null);

  // Читаем preview-cookie при монтировании и при открытии меню
  useEffect(() => {
    setPreviewRole(getCookie("admin_preview_role"));
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isAdmin = session?.user?.role === "ADMIN";
  const activeRole = previewRole ?? session?.user?.role ?? "STUDENT";

  const getDashboardLink = () => {
    switch (activeRole) {
      case "ADMIN":   return "/admin";
      case "AUTHOR":  return "/author/courses";
      case "CURATOR": return "/curator/submissions";
      default:        return "/dashboard";
    }
  };

  const switchRole = async (role: string, href: string) => {
    if (role === "ADMIN") {
      // Сброс preview — вернуться в режим админа
      await fetch("/api/admin/preview-role", { method: "DELETE" });
      setPreviewRole(null);
    } else {
      await fetch("/api/admin/preview-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      setPreviewRole(role);
    }
    setOpen(false);
    router.push(href);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      {/* Role preview banner */}
      {isAdmin && previewRole && (
        <div className="flex items-center justify-center gap-3 border-b bg-amber-50 px-4 py-1.5 text-xs text-amber-700">
          <Eye className="h-3.5 w-3.5" />
          <span>
            Вы просматриваете портал как{" "}
            <strong>
              {ROLE_OPTIONS.find((r) => r.value === previewRole)?.label ?? previewRole}
            </strong>
          </span>
          <button
            onClick={() => switchRole("ADMIN", "/admin")}
            className="rounded-full bg-amber-200 px-2 py-0.5 font-semibold hover:bg-amber-300 transition-colors"
          >
            Выйти из режима
          </button>
        </div>
      )}

      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={getDashboardLink()} className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
          >
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold">Академия Риэлторов</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-purple-700"
          >
            <BookOpen className="h-4 w-4" />
            Курсы
          </Link>
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {session ? (
            <>
              <Link href={getDashboardLink()} className="hidden md:block">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Кабинет
                </Button>
              </Link>

              {/* Custom avatar dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-1 rounded-full ring-2 ring-transparent transition-all hover:ring-purple-200 focus:outline-none focus:ring-purple-300"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user.image ?? ""} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold text-sm">
                      {session.user.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-xl border bg-popover shadow-xl">
                    {/* User info */}
                    <div className="border-b px-4 py-3">
                      <p className="text-sm font-semibold truncate">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>

                    {/* ── Role switcher for ADMIN ── */}
                    {isAdmin && (
                      <div className="border-b px-3 py-2">
                        <p className="mb-1.5 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Просмотр как
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {ROLE_OPTIONS.map((r) => {
                            const isActive = activeRole === r.value;
                            return (
                              <button
                                key={r.value}
                                onClick={() => switchRole(r.value, r.href)}
                                className={`
                                  flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all
                                  ${isActive
                                    ? "bg-purple-100 text-purple-700 ring-1 ring-purple-300"
                                    : "text-muted-foreground hover:bg-accent"
                                  }
                                `}
                              >
                                <span>{r.emoji}</span>
                                {r.label}
                                {isActive && <span className="ml-auto text-[10px] font-bold text-purple-500">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Профиль
                      </Link>
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        Кабинет
                      </Link>
                      {(session.user.role === "AUTHOR" || session.user.role === "ADMIN") && (
                        <Link
                          href="/author/analytics"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent transition-colors"
                        >
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          Аналитика
                        </Link>
                      )}
                      {session.user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent transition-colors"
                        >
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          Администрирование
                        </Link>
                      )}
                    </div>

                    {/* Sign out */}
                    <div className="border-t py-1">
                      <a
                        href="/signout"
                        onClick={async (e) => {
                          e.preventDefault();
                          setOpen(false);
                          await signOut({ callbackUrl: "/login" });
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Выйти
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Войти</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }} className="text-white">
                  Зарегистрироваться
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
