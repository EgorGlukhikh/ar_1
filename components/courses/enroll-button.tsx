"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  slug: string;
  isFree: boolean;
  price: number | null;
  userBalance?: number;
}

export function EnrollButton({ courseId, slug, isFree, price, userBalance = 0 }: EnrollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isPaid = !isFree && price && price > 0;
  const canAfford = userBalance >= (price ?? 0);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (res.status === 401) {
        router.push(`/login?callbackUrl=/courses/${slug}`);
        return;
      }

      if (res.status === 402) {
        const data = await res.json();
        toast.error(
          `Недостаточно средств на балансе. Нужно ${data.price?.toLocaleString()} ₽, есть ${data.balance?.toLocaleString()} ₽`
        );
        return;
      }

      if (!res.ok) {
        toast.error("Не удалось записаться");
        return;
      }

      const data = await res.json();
      if (data.paidFromBalance) {
        toast.success(`Оплачено с баланса ${price?.toLocaleString()} ₽`);
      } else {
        toast.success("Вы успешно записались!");
      }
      router.push(`/courses/${slug}/learn`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        size="lg"
        onClick={handleEnroll}
        disabled={loading || !!(isPaid && !canAfford)}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Обрабатываем...
          </>
        ) : isFree ? (
          "Записаться бесплатно"
        ) : price ? (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Оплатить {price.toLocaleString()} ₽
          </>
        ) : (
          "Оставить заявку"
        )}
      </Button>
      {isPaid && (
        <p className="text-center text-xs text-muted-foreground">
          Ваш баланс:{" "}
          <span className={canAfford ? "font-semibold text-emerald-600" : "font-semibold text-red-500"}>
            {userBalance.toLocaleString()} ₽
          </span>
          {!canAfford && (
            <span className="ml-1 text-red-500">— недостаточно средств</span>
          )}
        </p>
      )}
    </div>
  );
}
