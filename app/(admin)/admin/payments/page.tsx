import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDING: "Ожидание",
  PAID: "Оплачено",
  FAILED: "Ошибка",
  REFUNDED: "Возврат",
};

const statusVariant: Record<string, "default" | "outline" | "destructive" | "secondary"> = {
  PENDING: "secondary",
  PAID: "default",
  FAILED: "destructive",
  REFUNDED: "outline",
};

const providerLabels: Record<string, string> = {
  ROBOKASSA: "Robokassa",
  BANK131: "Bank 131",
  TBANK: "T-Bank",
  MANUAL: "Ручная",
  STRIPE: "Stripe",
};

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const payments = await prisma.payment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const totalRevenue = payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amount, 0);

  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const paidCount = payments.filter((p) => p.status === "PAID").length;
  const failedCount = payments.filter((p) => p.status === "FAILED").length;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Платежи</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Выручка
          </div>
          <p className="text-2xl font-bold">
            {totalRevenue.toLocaleString("ru-RU")} ₽
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Оплачено
          </div>
          <p className="text-2xl font-bold">{paidCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            Ожидание
          </div>
          <p className="text-2xl font-bold">{pendingCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <XCircle className="h-4 w-4 text-red-500" />
            Ошибки
          </div>
          <p className="text-2xl font-bold">{failedCount}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">История платежей</h2>
          <span className="text-muted-foreground text-sm ml-1">({payments.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-muted-foreground text-xs">
                <th className="text-left px-4 py-3 font-medium">Студент</th>
                <th className="text-left px-4 py-3 font-medium">Курс</th>
                <th className="text-right px-4 py-3 font-medium">Сумма</th>
                <th className="text-left px-4 py-3 font-medium">Провайдер</th>
                <th className="text-left px-4 py-3 font-medium">Статус</th>
                <th className="text-left px-4 py-3 font-medium">Дата</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Платежей пока нет
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.user.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{p.user.email}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="truncate">{p.course.title}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {p.amount.toLocaleString("ru-RU")} ₽
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {providerLabels[p.provider] ?? p.provider}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[p.status]} className="text-xs">
                      {statusLabels[p.status] ?? p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {p.createdAt.toLocaleDateString("ru-RU")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
