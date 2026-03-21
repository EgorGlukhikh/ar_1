"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RotateCcw, Loader2 } from "lucide-react";

export function ResetProgressButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetProgress = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${userId}/reset-progress`, {
        method: "POST",
      });
      toast.success("Прогресс сброшен");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-red-500 hover:bg-accent transition-colors">
        <RotateCcw className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сброс прогресса</DialogTitle>
          <DialogDescription>
            Сбросить весь прогресс обучения пользователя{" "}
            <strong>{userName}</strong>? Это действие необратимо.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={resetProgress} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сбросить прогресс
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
