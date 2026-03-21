"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const roles = [
  { value: "STUDENT", label: "Студент" },
  { value: "CURATOR", label: "Куратор" },
  { value: "AUTHOR", label: "Автор" },
  { value: "ADMIN", label: "Администратор" },
];

export function ChangeRoleButton({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const changeRole = async (role: string) => {
    if (role === currentRole) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      toast.success("Роль изменена");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium shadow-sm hover:bg-accent disabled:opacity-50"
        disabled={loading}
      >
        Роль <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {roles.map((r) => (
          <DropdownMenuItem
            key={r.value}
            onClick={() => changeRole(r.value)}
            className={currentRole === r.value ? "font-semibold text-primary" : ""}
          >
            {r.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
