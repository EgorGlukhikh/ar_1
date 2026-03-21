"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const getDashboardLink = () => {
    if (!session) return "/dashboard";
    switch (session.user.role) {
      case "ADMIN":
        return "/admin";
      case "AUTHOR":
        return "/author/courses";
      case "CURATOR":
        return "/curator/submissions";
      default:
        return "/dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold text-gray-900">
            Академия Риэлторов
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-primary"
          >
            <BookOpen className="h-4 w-4" />
            Курсы
          </Link>
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href={getDashboardLink()}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Кабинет
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image ?? ""} />
                    <AvatarFallback>
                      {session.user.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Профиль
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Кабинет
                  </DropdownMenuItem>
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Администрирование
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Зарегистрироваться</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
