import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, LayoutDashboard, BookOpen, Users, CreditCard, Settings, BarChart2 } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Все курсы", icon: BookOpen },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/payments", label: "Платежи", icon: CreditCard },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r bg-slate-900 text-white">
        <div className="flex h-16 items-center gap-2 border-b border-slate-700 px-4">
          <GraduationCap className="h-6 w-6 text-blue-400" />
          <span className="text-sm font-bold">Администратор</span>
        </div>
        <nav className="py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-0 w-56 border-t border-slate-700 px-4 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white"
          >
            ← На сайт
          </Link>
        </div>
      </aside>
      <div className="flex-1 bg-gray-50">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
