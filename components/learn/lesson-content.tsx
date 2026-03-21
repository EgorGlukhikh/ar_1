import { cn } from "@/lib/utils";

interface Props {
  content: string;
  className?: string;
}

export function LessonContent({ content, className }: Props) {
  return (
    <div
      className={cn(
        "prose prose-blue max-w-none",
        "prose-headings:font-bold prose-p:text-gray-700 prose-li:text-gray-700",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
