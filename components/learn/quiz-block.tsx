"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  type: "SINGLE" | "MULTI" | "TEXT";
  points: number;
  order: number;
  options: Option[];
}

interface Quiz {
  id: string;
  passingScore: number;
  questions: Question[];
}

interface QuizBlockProps {
  quiz: Quiz;
  onPassed?: () => void;
}

type Answers = Record<string, string[] | string>;

interface AttemptResult {
  scorePercent: number;
  passed: boolean;
  earned: number;
  total: number;
}

export function QuizBlock({ quiz, onPassed }: QuizBlockProps) {
  const questions = [...quiz.questions].sort((a, b) => a.order - b.order);

  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // current question index (for step mode)
  const [mode] = useState<"all" | "step">("all");

  const setOption = (questionId: string, optionId: string, type: string) => {
    if (type === "SINGLE") {
      setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }));
    } else if (type === "MULTI") {
      setAnswers((prev) => {
        const current = (prev[questionId] as string[]) ?? [];
        const already = current.includes(optionId);
        return {
          ...prev,
          [questionId]: already
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      });
    }
  };

  const setText = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const isOptionSelected = (questionId: string, optionId: string): boolean => {
    const ans = answers[questionId];
    if (Array.isArray(ans)) return ans.includes(optionId);
    return false;
  };

  const allAnswered = questions.every((q) => {
    const ans = answers[q.id];
    if (!ans) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    return ans.trim().length > 0;
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      setResult(data);
      if (data.passed) {
        toast.success("Тест пройден!");
        onPassed?.();
      } else {
        toast.error(`Не пройдено. Результат: ${data.scorePercent}%`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setStep(0);
  };

  if (result) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          {result.passed ? (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-400" />
          )}

          <div>
            <p className="text-3xl font-bold">
              {result.scorePercent}%
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {result.earned} из {result.total} баллов
            </p>
          </div>

          <Badge
            variant={result.passed ? "default" : "destructive"}
            className="text-sm px-4 py-1"
          >
            {result.passed ? "Тест пройден ✓" : "Не пройдено"}
          </Badge>

          <p className="text-sm text-muted-foreground">
            Проходной балл: {quiz.passingScore}%
          </p>

          {!result.passed && (
            <Button variant="outline" onClick={handleRetry} className="mt-2">
              <RotateCcw className="mr-2 h-4 w-4" />
              Пройти заново
            </Button>
          )}
        </div>

        {/* Show correct answers */}
        <div className="mt-4 border-t pt-4 space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Разбор ответов
          </p>
          {questions.map((q) => {
            const given = answers[q.id];
            const givenArr = Array.isArray(given) ? given : given ? [given] : [];
            const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
            const isCorrect =
              q.type === "TEXT"
                ? false
                : correctIds.length === givenArr.length &&
                  correctIds.every((id) => givenArr.includes(id));

            return (
              <div key={q.id} className="rounded-lg border p-4">
                <div className="flex items-start gap-2 mb-2">
                  {q.type !== "TEXT" && (
                    isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 mt-0.5 text-red-400 shrink-0" />
                    )
                  )}
                  <p className="text-sm font-medium">{q.text}</p>
                </div>
                {q.type === "TEXT" ? (
                  <p className="text-xs text-muted-foreground italic">
                    Ваш ответ: {given ?? "—"}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={cn(
                          "rounded px-3 py-1.5 text-sm",
                          opt.isCorrect
                            ? "bg-green-50 text-green-700 font-medium"
                            : givenArr.includes(opt.id)
                            ? "bg-red-50 text-red-600"
                            : "text-muted-foreground"
                        )}
                      >
                        {opt.isCorrect ? "✓ " : givenArr.includes(opt.id) ? "✗ " : ""}
                        {opt.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (mode === "all") {
    return (
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Тест по уроку</h2>
            <p className="text-sm text-muted-foreground">
              {questions.length} вопросов · проходной балл {quiz.passingScore}%
            </p>
          </div>
          <Badge variant="outline">{questions.length} вопр.</Badge>
        </div>

        <div className="p-6 space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="space-y-3">
              <p className="font-medium text-sm">
                <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                {q.text}
                {q.type === "MULTI" && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    (несколько вариантов)
                  </span>
                )}
              </p>

              {q.type === "TEXT" ? (
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Введите ваш ответ..."
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => setText(q.id, e.target.value)}
                />
              ) : (
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const selected = isOptionSelected(q.id, opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setOption(q.id, opt.id, q.type)}
                        className={cn(
                          "w-full text-left rounded-lg border px-4 py-3 text-sm transition-all",
                          selected
                            ? "border-primary bg-primary/5 font-medium"
                            : "hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded mr-3 border text-xs shrink-0 align-middle",
                            selected
                              ? "bg-primary border-primary text-white"
                              : "border-gray-300"
                          )}
                        >
                          {selected && "✓"}
                        </span>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || loading}
            className="w-full h-12 text-base"
          >
            {loading ? "Проверяем..." : "Отправить ответы"}
            {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>

          {!allAnswered && (
            <p className="text-xs text-center text-muted-foreground">
              Ответьте на все вопросы, чтобы отправить тест
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
