"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  PlayCircle,
  FileText,
  CheckSquare,
  ClipboardList,
  Video,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { AddBlockModal } from "./add-block-modal";

export interface LessonBlock {
  id: string;
  type: string;
  order: number;
  title: string | null;
}

const blockIcons: Record<string, React.ReactNode> = {
  VIDEO:      <PlayCircle className="h-3.5 w-3.5 text-blue-500" />,
  TEXT:       <FileText className="h-3.5 w-3.5 text-gray-500" />,
  QUIZ:       <CheckSquare className="h-3.5 w-3.5 text-green-600" />,
  ASSIGNMENT: <ClipboardList className="h-3.5 w-3.5 text-orange-500" />,
  WEBINAR:    <Video className="h-3.5 w-3.5 text-purple-500" />,
};

const blockLabels: Record<string, string> = {
  VIDEO:      "Видео",
  TEXT:       "Текст",
  QUIZ:       "Тест",
  ASSIGNMENT: "Задание",
  WEBINAR:    "Вебинар",
};

const blockColors: Record<string, string> = {
  VIDEO:      "text-blue-600 border-blue-200",
  TEXT:       "text-gray-600 border-gray-200",
  QUIZ:       "text-green-600 border-green-200",
  ASSIGNMENT: "text-orange-500 border-orange-200",
  WEBINAR:    "text-purple-600 border-purple-200",
};

function SortableBlock({
  block,
  lessonId,
  courseId,
  onDelete,
}: {
  block: LessonBlock;
  lessonId: string;
  courseId: string;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border bg-white p-2 mb-1"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500">
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <span>{blockIcons[block.type] ?? <FileText className="h-3.5 w-3.5" />}</span>
      <span className="flex-1 text-sm line-clamp-1 text-muted-foreground">
        {block.title || blockLabels[block.type]}
      </span>

      <Badge variant="outline" className={`text-xs ${blockColors[block.type] ?? ""}`}>
        {blockLabels[block.type] ?? block.type}
      </Badge>

      <Link href={`/author/courses/${courseId}/lessons/${lessonId}/blocks/${block.id}`}>
        <button className="text-gray-400 hover:text-blue-500">
          <Edit className="h-3.5 w-3.5" />
        </button>
      </Link>
      <button
        onClick={() => onDelete(block.id)}
        className="text-gray-300 hover:text-red-500"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function BlockList({
  lessonId,
  courseId,
  blocks: initialBlocks,
}: {
  lessonId: string;
  courseId: string;
  blocks: LessonBlock[];
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [modalOpen, setModalOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIndex, newIndex).map((b, i) => ({
      ...b,
      order: i + 1,
    }));
    setBlocks(reordered);

    await fetch(`/api/lessons/${lessonId}/reorder-blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks: reordered.map((b) => ({ id: b.id, order: b.order })) }),
    });
  };

  const addBlock = async (type: string, title: string) => {
    const res = await fetch(`/api/lessons/${lessonId}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title }),
    });
    const block = await res.json();
    setBlocks((p) => [...p, block]);
    toast.success("Блок добавлен");
  };

  const deleteBlock = async (id: string) => {
    await fetch(`/api/blocks/${id}`, { method: "DELETE" });
    setBlocks((p) => p.filter((b) => b.id !== id));
    toast.success("Блок удалён");
  };

  return (
    <div className="pl-4 border-l-2 border-gray-100 ml-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              lessonId={lessonId}
              courseId={courseId}
              onDelete={deleteBlock}
            />
          ))}
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <p className="py-1 text-xs text-muted-foreground">Нет блоков</p>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
      >
        <Plus className="h-3.5 w-3.5" />
        Добавить блок
      </button>

      <AddBlockModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addBlock}
      />
    </div>
  );
}
