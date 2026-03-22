"use client";

// Reference: LearnDash "Switch to Student View" banner pattern
// Shown at top of any page when admin is in preview mode
// The cookie is read client-side (httpOnly=false) so this component can detect it

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, X, ChevronDown } from "lucide-react";

const ROLES = [
  { value: "STUDENT", label: "Студент", color: "bg-blue-600" },
  { value: "AUTHOR", label: "Автор", color: "bg-indigo-600" },
  { value: "CURATOR", label: "Куратор", color: "bg-purple-600" },
] as const;

type Role = typeof ROLES[number]["value"];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function RolePreviewBanner() {
  const [adminCookie, setAdminCookie] = useState<string | null>(null); // original role stored separately
  const [previewRole, setPreviewRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin (we store this in session, but for quick client check
    // we rely on the preview cookie absence = admin viewing normally)
    const pr = getCookie("admin_preview_role");
    setPreviewRole(pr);
    // Check if we have special admin indicator — set by layout below
    setAdminCookie(getCookie("is_admin_session"));
  }, []);

  async function switchTo(role: Role | null) {
    setLoading(true);
    setOpen(false);
    if (!role) {
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
    setLoading(false);
    router.refresh();
  }

  // Only show if user is admin (we need the admin cookie)
  if (!adminCookie) return null;

  const currentLabel = ROLES.find((r) => r.value === previewRole)?.label;

  return (
    <div
      className={`fixed bottom-4 right-4 z-[9999] flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg ${
        previewRole ? "bg-amber-500" : "bg-slate-700"
      }`}
    >
      <Eye className="h-4 w-4" />
      {previewRole ? (
        <span>Вид: {currentLabel}</span>
      ) : (
        <span>Режим просмотра</span>
      )}

      {/* Role picker */}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={loading}
          className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs hover:bg-white/30"
        >
          Сменить <ChevronDown className="h-3 w-3" />
        </button>

        {open && (
          <div className="absolute bottom-8 right-0 min-w-[140px] overflow-hidden rounded-lg border bg-white shadow-xl">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => switchTo(r.value)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 ${
                  previewRole === r.value ? "font-semibold" : ""
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${r.color}`} />
                {r.label}
              </button>
            ))}
            <div className="border-t" />
            <button
              onClick={() => switchTo(null)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
            >
              <X className="h-3.5 w-3.5" />
              Выйти из режима
            </button>
          </div>
        )}
      </div>

      {previewRole && (
        <button onClick={() => switchTo(null)} title="Выйти">
          <X className="h-4 w-4 opacity-70 hover:opacity-100" />
        </button>
      )}
    </div>
  );
}
