"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react";

interface Props {
  submissionId: string;
}

export function SubmissionReviewButton({ submissionId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const review = async (status: "APPROVED" | "REJECTED" | "REVISION") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback }),
      });
      if (!res.ok) throw new Error();

      const labels = {
        APPROVED: "Принято!",
        REJECTED: "Отклонено",
        REVISION: "Отправлено на доработку",
      };
      toast.success(labels[status]);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent transition-colors">
        Проверить
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Проверка задания</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Комментарий (необязательно)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Оставьте обратную связь студенту..."
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"
              onClick={() => review("APPROVED")}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Принять
            </Button>
            <Button
              className="flex-1 gap-1.5"
              variant="outline"
              onClick={() => review("REVISION")}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
              На доработку
            </Button>
            <Button
              className="flex-1 gap-1.5"
              variant="destructive"
              onClick={() => review("REJECTED")}
              disabled={loading}
            >
              <XCircle className="h-4 w-4" />
              Отклонить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
