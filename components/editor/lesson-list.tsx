"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Trash2,
  PlayCircle,
  BookOpen,
  CheckCircle,
  Award,
  Edit,
} from "lucide-react";
import Link from "next/link";

interface Lesson {
  id: string; title: string; order: number; type: string;
  isPreview: boolean; videoType: string | null; videoUrl: string | null;
}

const typeIcons: Record<string, React.ReactNode> = {
  VIDEO: <PlayCircle className="h-3.5 w-3.5 text-blue-500" />,
  TEXT: <BookOpen className="h-3.5 w-3.5 text-gray-400" />,
  QUIZ: <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
  ASSIGNMENT: <Award className="h-3.5 w-3.5 text-orange-400" />,
  WEBINAR: <PlayCircle className="h-3.5 w-3.5 text-purple-500" />,
};

const typeLabels: Record<string, string> = {
  VIDEO: "Видео",
  TEXT: "Текст",
  QUIZ: "Тест",
  ASSIGNMENT: "Задание",
  WEBINAR: "Вебинар",
};

function SortableLesson({
  lesson,
  moduleId,
  courseId,
  onDelete,
}: {
  lesson: Lesson;
  moduleId: string;
  courseId: string;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border bg-gray-50 p-2 mb-1.5"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500">
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <span>{typeIcons[lesson.type]}</span>
      <span className="flex-1 text-sm line-clamp-1">{lesson.title}</span>

      <Badge variant="outline" className="text-xs">
        {typeLabels[lesson.type]}
      </Badge>
      {lesson.isPreview && (
        <Badge variant="outline" className="text-xs text-green-600 border-green-300">
          Превью
        </Badge>
      )}

      <Link href={`/author/courses/${courseId}/lessons/${lesson.id}`}>
        <button className="text-gray-400 hover:text-blue-500">
          <Edit className="h-3.5 w-3.5" />
        </button>
      </Link>
      <button
        onClick={() => onDelete(lesson.id)}
        className="text-gray-300 hover:text-red-500"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function LessonList({
  courseId,
  moduleId,
  lessons: initialLessons,
}: {
  courseId: string;
  moduleId: string;
  lessons: Lesson[];
}) {
  const [lessons, setLessons] = useState(initialLessons);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("VIDEO");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(lessons, oldIndex, newIndex).map((l, i) => ({
      ...l,
      order: i + 1,
    }));
    setLessons(reordered);

    await fetch(`/api/modules/${moduleId}/reorder-lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessons: reordered.map((l) => ({ id: l.id, order: l.order })) }),
    });
  };

  const addLesson = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, type: newType }),
      });
      const lesson = await res.json();
      setLessons((p) => [...p, lesson]);
      setNewTitle("");
      setShowAdd(false);
      toast.success("Урок добавлен");
    } finally {
      setAdding(false);
    }
  };

  const deleteLesson = async (id: string) => {
    await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    setLessons((p) => p.filter((l) => l.id !== id));
    toast.success("Урок удалён");
  };

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lessons.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {lessons.map((lesson) => (
            <SortableLesson
              key={lesson.id}
              lesson={lesson}
              moduleId={moduleId}
              courseId={courseId}
              onDelete={deleteLesson}
            />
          ))}
        </SortableContext>
      </DndContext>

      {showAdd ? (
        <div className="mt-2 flex gap-2">
          <Select value={newType} onValueChange={(v) => setNewType(v ?? "VIDEO")}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIDEO">Видео</SelectItem>
              <SelectItem value="TEXT">Текст</SelectItem>
              <SelectItem value="QUIZ">Тест</SelectItem>
              <SelectItem value="ASSIGNMENT">Задание</SelectItem>
              <SelectItem value="WEBINAR">Вебинар</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Название урока"
            className="h-8 text-xs"
            onKeyDown={(e) => e.key === "Enter" && addLesson()}
            autoFocus
          />
          <Button onClick={addLesson} disabled={adding} size="sm" className="h-8 text-xs">
            {adding ? "..." : "Добавить"}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setShowAdd(false)}>
            ✕
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-blue-600"
        >
          <Plus className="h-3.5 w-3.5" />
          Добавить урок
        </button>
      )}
    </div>
  );
}
