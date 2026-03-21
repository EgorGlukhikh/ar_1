"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, GraduationCap, ArrowLeft } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MobileSidebarProps {
  title: string;
  navItems: NavItem[];
  backHref?: string;
  backLabel?: string;
  dark?: boolean;
}

export function MobileSidebar({
  title,
  navItems,
  backHref = "/dashboard",
  backLabel = "На сайт",
  dark = false,
}: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);
  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const bg = dark ? "bg-slate-900 text-white" : "bg-white text-gray-900";
  const linkBase = dark
    ? "text-slate-300 hover:bg-slate-800 hover:text-white"
    : "text-gray-600 hover:bg-purple-50 hover:text-purple-700";
  const activeClass = dark
    ? "bg-slate-800 text-white"
    : "bg-purple-50 text-purple-700 font-medium";
  const borderClass = dark ? "border-slate-700" : "border-gray-100";

  return (
    <>
      {/* Toggle button — visible on mobile */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl shadow-md lg:hidden ${dark ? "bg-slate-800 text-white" : "bg-white text-gray-700 border border-gray-200"}`}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col transition-transform duration-200 lg:hidden ${bg} ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className={`flex h-16 items-center justify-between border-b px-4 ${borderClass}`}>
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #7C5CFC, #9B5CF6)" }}
            >
              <GraduationCap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">{title}</span>
          </div>
          <button onClick={() => setOpen(false)}>
            <X className="h-5 w-5 opacity-60" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${active ? activeClass : linkBase}`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className={`border-t px-4 py-4 ${borderClass}`}>
          <Link
            href={backHref}
            className={`flex items-center gap-2 text-xs transition-colors ${dark ? "text-slate-400 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        </div>
      </aside>
    </>
  );
}
