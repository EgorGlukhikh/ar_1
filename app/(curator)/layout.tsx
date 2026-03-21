import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ClipboardList, Users } from "lucide-react";

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
      <aside className="w-56 shrink-0 border-r bg-white">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <GraduationCap className="h-6 w-6 text-blue-700" />
          <span className="text-sm font-bold">Кабинет куратора</span>
        </div>
        <nav className="py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <item.icon className="h-4 w-4 text-gray-400" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 bg-gray-50">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
