"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
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
  Menu,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getDashboardLink = () => {
    if (!session) return "/dashboard";
    switch (session.user.role) {
      case "ADMIN": return "/admin";
      case "AUTHOR": return "/author/courses";
      case "CURATOR": return "/curator/submissions";
      default: return "/dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
          >
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">Академия Риэлторов</span>
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
        <div className="flex items-center gap-3">
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
                  className="flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-transparent transition-all hover:ring-purple-200 focus:outline-none focus:ring-purple-300"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user.image ?? ""} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold text-sm">
                      {session.user.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {open && (
                  <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border bg-white shadow-xl">
                    {/* User info */}
                    <div className="border-b px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        Профиль
                      </Link>
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-gray-400" />
                        Кабинет
                      </Link>
                      {(session.user.role === "AUTHOR" || session.user.role === "ADMIN") && (
                        <Link
                          href="/author/analytics"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <BarChart3 className="h-4 w-4 text-gray-400" />
                          Аналитика
                        </Link>
                      )}
                      {session.user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          Администрирование
                        </Link>
                      )}
                    </div>

                    {/* Sign out */}
                    <div className="border-t py-1">
                      <a
                        href="/api/auth/signout"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
