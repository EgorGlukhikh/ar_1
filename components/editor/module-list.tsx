"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { GripVertical, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { LessonList } from "./lesson-list";

interface LessonBlock { id: string; type: string; order: number; title: string | null; }

interface Lesson {
  id: string; title: string; order: number; type: string;
  isPreview: boolean; videoType: string | null; videoUrl: string | null;
  blocks: LessonBlock[];
}

interface Module { id: string; title: string; order: number; lessons: Lesson[] }

interface Props { courseId: string; modules: Module[] }

function SortableModule({
  module,
  courseId,
  onDelete,
  onUpdate,
}: {
  module: Module;
  courseId: string;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(module.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const saveTitle = async () => {
    setEditingTitle(false);
    if (title === module.title) return;
    await fetch(`/api/modules/${module.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    onUpdate(module.id, title);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-3">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 p-3">
            <button {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500">
              <GripVertical className="h-4 w-4" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {editingTitle ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                className="h-7 text-sm"
                autoFocus
              />
            ) : (
              <button
                className="flex-1 text-left text-sm font-semibold hover:text-blue-600"
                onClick={() => setEditingTitle(true)}
              >
                {module.title}
              </button>
            )}

            <Badge variant="secondary" className="text-xs">
              {module.lessons.length} {module.lessons.length === 1 ? "урок" : module.lessons.length < 5 ? "урока" : "уроков"}
            </Badge>
            <button
              onClick={() => onDelete(module.id)}
              className="text-gray-300 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {expanded && (
            <div className="border-t px-3 pb-3 pt-2">
              <LessonList courseId={courseId} moduleId={module.id} lessons={module.lessons} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ModuleList({ courseId, modules: initialModules }: Props) {
  const [modules, setModules] = useState(initialModules);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(modules, oldIndex, newIndex).map((m, i) => ({
      ...m,
      order: i + 1,
    }));
    setModules(reordered);

    await fetch(`/api/courses/${courseId}/reorder-modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modules: reordered.map((m) => ({ id: m.id, order: m.order })) }),
    });
  };

  const addModule = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      const mod = await res.json();
      setModules((p) => [...p, { ...mod, lessons: [] }]);
      setNewTitle("");
      setShowAdd(false);
      toast.success("Модуль добавлен");
    } finally {
      setAdding(false);
    }
  };

  const deleteModule = async (id: string) => {
    await fetch(`/api/modules/${id}`, { method: "DELETE" });
    setModules((p) => p.filter((m) => m.id !== id));
    toast.success("Модуль удалён");
  };

  const updateModule = (id: string, title: string) => {
    setModules((p) => p.map((m) => (m.id === id ? { ...m, title } : m)));
  };

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Программа курса</h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus className="h-3.5 w-3.5" />
          Добавить модуль
        </Button>
      </div>

      {showAdd && (
        <div className="mb-4 flex gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Название модуля"
            onKeyDown={(e) => e.key === "Enter" && addModule()}
            autoFocus
          />
          <Button onClick={addModule} disabled={adding} size="sm">
            {adding ? "..." : "Добавить"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
            Отмена
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={modules.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          {modules.map((module) => (
            <SortableModule
              key={module.id}
              module={module}
              courseId={courseId}
              onDelete={deleteModule}
              onUpdate={updateModule}
            />
          ))}
        </SortableContext>
      </DndContext>

      {modules.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Добавьте первый модуль, чтобы начать
        </p>
      )}
    </div>
  );
}
