import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

const navItems = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Все курсы", icon: BookOpen },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/payments", label: "Платежи", icon: CreditCard },
  { href: "/admin/analytics", label: "Аналитика", icon: BarChart3 },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-slate-900 text-white">
        <div className="flex h-16 items-center gap-2 border-b border-slate-700 px-4">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
          >
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold">Администратор</span>
        </div>
        <nav className="flex-1 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-700 px-4 py-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Лендинг
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Кабинет студента
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <MobileSidebar
        title="Администратор"
        navItems={navItems}
        dark={true}
        backHref="/"
        backLabel="Лендинг"
      />

      <div className="flex-1 bg-gray-50 min-w-0">
        <main className="p-4 pt-16 lg:p-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
