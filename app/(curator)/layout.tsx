import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ClipboardList, Users, ArrowLeft } from "lucide-react";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

const navItems = [
  { href: "/curator/submissions", label: "Проверка ДЗ", icon: ClipboardList },
  { href: "/curator/students", label: "Студенты", icon: Users },
];

export default async function CuratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "CURATOR" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r bg-white">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
          >
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Кабинет куратора</span>
        </div>
        <nav className="flex-1 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-700"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t px-4 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-gray-400 transition-colors hover:text-gray-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            На сайт
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <MobileSidebar
        title="Кабинет куратора"
        navItems={navItems}
        dark={false}
        backHref="/dashboard"
        backLabel="На сайт"
      />

      <div className="flex-1 bg-gray-50 min-w-0">
        <main className="p-4 pt-16 lg:p-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
