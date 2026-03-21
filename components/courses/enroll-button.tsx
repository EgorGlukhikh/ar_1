"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  slug: string;
  isFree: boolean;
  price: number | null;
}

export function EnrollButton({ courseId, slug, isFree, price }: EnrollButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/courses/${slug}`);
      return;
    }

    if (!isFree && price) {
      // Redirect to payment page
      router.push(`/courses/${slug}/checkout`);
      return;
    }

    // Free enrollment
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!res.ok) {
        toast.error("Не удалось записаться на курс");
        return;
      }

      toast.success("Вы успешно записались на курс!");
      router.push(`/courses/${slug}/learn`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleEnroll}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Записываемся...
        </>
      ) : isFree ? (
        "Записаться бесплатно"
      ) : price ? (
        `Купить за ${price.toLocaleString()} ₽`
      ) : (
        "Оставить заявку"
      )}
    </Button>
  );
}
