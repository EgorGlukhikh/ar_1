"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROLES = [
  { value: "STUDENT", label: "👤 Студент", href: "/dashboard" },
  { value: "AUTHOR", label: "✍️ Автор", href: "/author/courses" },
  { value: "CURATOR", label: "🎓 Куратор", href: "/curator/submissions" },
] as const;

type Role = typeof ROLES[number]["value"];

export function RolePreviewSwitcher() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function preview(role: Role, href: string) {
    setLoading(true);
    await fetch("/api/admin/preview-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setLoading(false);
    router.push(href);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Eye className="h-4 w-4" />
        Смотреть как:
      </span>
      {ROLES.map((r) => (
        <Button
          key={r.value}
          variant="outline"
          size="sm"
          onClick={() => preview(r.value, r.href)}
          disabled={loading}
          className="text-xs"
        >
          {r.label}
        </Button>
      ))}
    </div>
  );
}
