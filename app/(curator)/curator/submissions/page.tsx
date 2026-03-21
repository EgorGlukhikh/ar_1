import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SubmissionReviewButton } from "@/components/curator/submission-review-button";
import { ClipboardList, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

const statusLabel: Record<string, { label: string; color: string }> = {
  PENDING: { label: "На проверке", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Принято", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Отклонено", color: "bg-red-100 text-red-700" },
  REVISION: { label: "На доработку", color: "bg-orange-100 text-orange-700" },
};

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await auth();
  if (!session) redirect("/login");

  const submissions = await prisma.submission.findMany({
    where: {
      ...(status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "REVISION" } : {}),
    },
    include: {
      student: { select: { id: true, name: true, email: true, image: true } },
      assignment: {
        include: {
          lesson: {
            include: { module: { include: { course: { select: { title: true } } } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = submissions.filter((s) => s.status === "PENDING").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Проверка домашних заданий</h1>
        {pending > 0 && (
          <p className="text-muted-foreground">{pending} ожидают проверки</p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {[
          { label: "Все", value: "" },
          { label: "На проверке", value: "PENDING" },
          { label: "Принято", value: "APPROVED" },
          { label: "Отклонено", value: "REJECTED" },
        ].map((tab) => (
          <a
            key={tab.value}
            href={tab.value ? `?status=${tab.value}` : "?"}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              (status ?? "") === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-muted-foreground">Нет заданий для проверки</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const st = statusLabel[sub.status];
            return (
              <Card key={sub.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback>
                        {sub.student.name?.[0]?.toUpperCase() ?? "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{sub.student.name}</span>
                        <Badge className={`${st.color} border-0 text-xs`}>
                          {st.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {sub.assignment.lesson.module.course.title} →{" "}
                        {sub.assignment.lesson.title}
                      </p>
                      {sub.content && (
                        <p className="mt-2 text-sm line-clamp-2 text-gray-700">
                          {sub.content}
                        </p>
                      )}
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(sub.createdAt, {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </p>
                    </div>
                    {sub.status === "PENDING" && (
                      <SubmissionReviewButton submissionId={sub.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
