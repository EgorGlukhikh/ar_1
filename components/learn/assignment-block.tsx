"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Send, FileText, CheckCircle2, Clock, XCircle, AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Assignment {
  id: string;
  description: string;
  requiresReview: boolean;
  maxScore: number;
  deadline: number | null;
}

interface Submission {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVISION";
  content: string | null;
  fileUrl: string | null;
  feedback: string | null;
  score: number | null;
  createdAt: string;
}

interface AssignmentBlockProps {
  assignment: Assignment;
  onApproved?: () => void;
}

const statusConfig = {
  PENDING: { label: "На проверке", icon: Clock, color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  APPROVED: { label: "Принято", icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-200" },
  REJECTED: { label: "Отклонено", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
  REVISION: { label: "Требует доработки", icon: AlertCircle, color: "text-orange-600 bg-orange-50 border-orange-200" },
};

export function AssignmentBlock({ assignment, onApproved }: AssignmentBlockProps) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [tab, setTab] = useState<"text" | "file">("text");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(`/api/assignments/${assignment.id}/submit`)
      .then((r) => r.json())
      .then((data) => {
        setSubmission(data);
        if (data?.status === "APPROVED") onApproved?.();
      })
      .finally(() => setLoadingInit(false));
  }, [assignment.id, onApproved]);

  const handleSubmit = async () => {
    const payload = tab === "text" ? { content } : { fileUrl };
    if (tab === "text" && !content.trim()) {
      toast.error("Напишите текст ответа");
      return;
    }
    if (tab === "file" && !fileUrl.trim()) {
      toast.error("Вставьте ссылку на файл");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/assignments/${assignment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Ошибка отправки");
        return;
      }
      const data = await res.json();
      setSubmission(data);
      setShowForm(false);
      toast.success("Домашнее задание отправлено!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInit) {
    return (
      <div className="rounded-2xl border bg-white p-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-orange-50 border-b border-orange-100 px-6 py-4 flex items-center gap-3">
        <FileText className="h-5 w-5 text-orange-500 shrink-0" />
        <div>
          <h2 className="font-semibold text-lg">Домашнее задание</h2>
          <p className="text-sm text-muted-foreground">
            {assignment.requiresReview ? "Проверяется куратором" : "Самопроверка"} · макс. {assignment.maxScore} баллов
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Description */}
        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="whitespace-pre-wrap">{assignment.description}</p>
        </div>

        {/* Existing submission status */}
        {submission && !showForm && (
          <div className={cn("rounded-xl border p-4", statusConfig[submission.status].color)}>
            <div className="flex items-start gap-3">
              {(() => {
                const Icon = statusConfig[submission.status].icon;
                return <Icon className="h-5 w-5 mt-0.5 shrink-0" />;
              })()}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{statusConfig[submission.status].label}</p>

                {submission.score !== null && (
                  <p className="text-sm mt-1">
                    Оценка: <strong>{submission.score}</strong> / {assignment.maxScore}
                  </p>
                )}

                {submission.feedback && (
                  <div className="mt-3 rounded-lg bg-white/60 border px-3 py-2">
                    <p className="text-xs font-semibold mb-1">Комментарий куратора:</p>
                    <p className="text-sm whitespace-pre-wrap">{submission.feedback}</p>
                  </div>
                )}

                {submission.content && (
                  <details className="mt-3">
                    <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                      Ваш ответ
                    </summary>
                    <p className="mt-1 text-sm whitespace-pre-wrap text-foreground/80">
                      {submission.content}
                    </p>
                  </details>
                )}

                {submission.fileUrl && (
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs underline"
                  >
                    <Upload className="h-3 w-3" />
                    Прикреплённый файл
                  </a>
                )}
              </div>
            </div>

            {(submission.status === "REJECTED" || submission.status === "REVISION") && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3 bg-white"
                onClick={() => {
                  setContent(submission.content ?? "");
                  setFileUrl(submission.fileUrl ?? "");
                  setShowForm(true);
                }}
              >
                Отправить повторно
              </Button>
            )}
          </div>
        )}

        {/* Submit form */}
        {(!submission || showForm) && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setTab("text")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm transition-all",
                  tab === "text"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                )}
              >
                Текстом
              </button>
              <button
                onClick={() => setTab("file")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm transition-all",
                  tab === "file"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                )}
              >
                Ссылка на файл
              </button>
            </div>

            {tab === "text" ? (
              <textarea
                className="w-full rounded-xl border px-4 py-3 text-sm resize-none h-36 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-gray-50 focus:bg-white transition-colors"
                placeholder="Введите ваш ответ на задание..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-gray-50 focus:bg-white transition-colors"
                  placeholder="https://drive.google.com/... или другая ссылка"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Вставьте ссылку на Google Drive, Яндекс Диск, Dropbox и т.д.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="h-11"
              >
                {submitting ? (
                  "Отправляем..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {submission ? "Отправить повторно" : "Отправить задание"}
                  </>
                )}
              </Button>
              {showForm && submission && (
                <Button
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Отмена
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
