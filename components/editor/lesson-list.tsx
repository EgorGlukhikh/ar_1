"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { BlockList, type LessonBlock } from "./block-list";

interface Lesson {
  id: string;
  title: string;
  order: number;
  type: string;
  isPreview: boolean;
  videoType: string | null;
  videoUrl: string | null;
  blocks: LessonBlock[];
}

function SortableLesson({
  lesson,
  moduleId,
  courseId,
  onDelete,
  onRename,
}: {
  lesson: Lesson;
  moduleId: string;
  courseId: string;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(lesson.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const saveTitle = async () => {
    setEditingTitle(false);
    if (title === lesson.title) return;
    await fetch(`/api/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    onRename(lesson.id, title);
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      {/* Lesson header row */}
      <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-300 hover:text-gray-500"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>

        {editingTitle ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            className="h-6 text-xs flex-1"
            autoFocus
          />
        ) : (
          <button
            className="flex-1 text-left text-sm font-medium hover:text-blue-600 line-clamp-1"
            onClick={() => setEditingTitle(true)}
          >
            {lesson.title}
          </button>
        )}

        <Badge variant="secondary" className="text-xs shrink-0">
          {lesson.blocks.length} блоков
        </Badge>
        {lesson.isPreview && (
          <Badge variant="outline" className="text-xs text-green-600 border-green-300 shrink-0">
            Превью
          </Badge>
        )}

        <button
          onClick={() => onDelete(lesson.id)}
          className="text-gray-300 hover:text-red-500 shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Blocks inside lesson */}
      {expanded && (
        <div className="mt-1 ml-6">
          <BlockList
            lessonId={lesson.id}
            courseId={courseId}
            blocks={lesson.blocks}
          />
        </div>
      )}
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
        body: JSON.stringify({ title: newTitle, type: "VIDEO" }),
      });
      const lesson = await res.json();
      setLessons((p) => [...p, { ...lesson, blocks: [] }]);
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

  const renameLesson = (id: string, title: string) => {
    setLessons((p) => p.map((l) => (l.id === id ? { ...l, title } : l)));
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
              onRename={renameLesson}
            />
          ))}
        </SortableContext>
      </DndContext>

      {showAdd ? (
        <div className="mt-2 flex gap-2">
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
