import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ChangeRoleButton } from "@/components/admin/change-role-button";
import { ResetProgressButton } from "@/components/admin/reset-progress-button";
import { AddBalanceButton } from "@/components/admin/add-balance-button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const roleLabel: Record<string, { label: string; color: string }> = {
  ADMIN: { label: "Администратор", color: "bg-red-100 text-red-700" },
  AUTHOR: { label: "Автор", color: "bg-blue-100 text-blue-700" },
  CURATOR: { label: "Куратор", color: "bg-purple-100 text-purple-700" },
  STUDENT: { label: "Студент", color: "bg-gray-100 text-gray-700" },
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const { role, q } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role: role as "ADMIN" | "AUTHOR" | "CURATOR" | "STUDENT" } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { enrollments: true, courses: true } },
    },
    // balance is selected from User by default
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Пользователи ({users.length})</h1>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        {["", "ADMIN", "AUTHOR", "CURATOR", "STUDENT"].map((r) => (
          <a
            key={r}
            href={r ? `?role=${r}` : "?"}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              (role ?? "") === r
                ? "bg-primary text-primary-foreground"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {r ? roleLabel[r]?.label : "Все"}
          </a>
        ))}
      </div>

      <div className="space-y-2">
        {users.map((user) => {
          const rl = roleLabel[user.role];
          return (
            <Card key={user.id}>
              <CardContent className="flex items-center gap-4 p-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback>
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{user.name ?? "—"}</span>
                    <Badge className={`${rl.color} border-0 text-xs`}>
                      {rl.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <div className="mt-0.5 flex gap-3 text-xs text-muted-foreground">
                    <span>{user._count.enrollments} курсов</span>
                    {user._count.courses > 0 && (
                      <span>{user._count.courses} создано</span>
                    )}
                    <span>
                      {format(user.createdAt, "d MMM yyyy", { locale: ru })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <AddBalanceButton userId={user.id} currentBalance={user.balance} />
                  <ResetProgressButton userId={user.id} userName={user.name ?? user.email} />
                  <ChangeRoleButton userId={user.id} currentRole={user.role} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
