"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  FileText,
  CheckSquare,
  ClipboardList,
  Video,
} from "lucide-react";

interface BlockTypeOption {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  bg: string;
  ring: string;
  selectedBg: string;
}

const BLOCK_TYPES: BlockTypeOption[] = [
  {
    type: "VIDEO",
    label: "Видео",
    description: "YouTube, Rutube, Яндекс Диск или загрузка файла",
    icon: <PlayCircle className="h-8 w-8" />,
    bg: "bg-blue-50 text-blue-600",
    ring: "ring-blue-300",
    selectedBg: "bg-blue-100 border-blue-400",
  },
  {
    type: "TEXT",
    label: "Текст",
    description: "Статья, лекция, форматированный контент",
    icon: <FileText className="h-8 w-8" />,
    bg: "bg-gray-50 text-gray-600",
    ring: "ring-gray-300",
    selectedBg: "bg-gray-100 border-gray-400",
  },
  {
    type: "QUIZ",
    label: "Тест",
    description: "Вопросы с автоматической проверкой",
    icon: <CheckSquare className="h-8 w-8" />,
    bg: "bg-green-50 text-green-600",
    ring: "ring-green-300",
    selectedBg: "bg-green-100 border-green-400",
  },
  {
    type: "ASSIGNMENT",
    label: "Задание",
    description: "Домашнее задание с проверкой куратором",
    icon: <ClipboardList className="h-8 w-8" />,
    bg: "bg-orange-50 text-orange-500",
    ring: "ring-orange-300",
    selectedBg: "bg-orange-100 border-orange-400",
  },
  {
    type: "WEBINAR",
    label: "Вебинар",
    description: "Запись эфира или ссылка на трансляцию",
    icon: <Video className="h-8 w-8" />,
    bg: "bg-purple-50 text-purple-600",
    ring: "ring-purple-300",
    selectedBg: "bg-purple-100 border-purple-400",
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string, title: string) => Promise<void>;
}

export function AddBlockModal({ open, onClose, onAdd }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedOption = BLOCK_TYPES.find((b) => b.type === selected);

  const handleAdd = async () => {
    if (!selected) return;
    setLoading(true);
    await onAdd(selected, title.trim() || selectedOption?.label || "");
    setLoading(false);
    setSelected(null);
    setTitle("");
    onClose();
  };

  const handleClose = () => {
    setSelected(null);
    setTitle("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base">Выберите тип блока</DialogTitle>
        </DialogHeader>

        {/* Сетка карточек типов блоков */}
        <div className="grid grid-cols-2 gap-3 mt-1 sm:grid-cols-3">
          {BLOCK_TYPES.map((opt) => {
            const isSelected = selected === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => setSelected(opt.type)}
                className={`
                  relative flex flex-col gap-3 rounded-xl border-2 p-4 text-left
                  transition-all duration-150
                  ${
                    isSelected
                      ? `${opt.selectedBg} ring-2 ${opt.ring} shadow-sm`
                      : "border-border bg-background hover:border-muted-foreground/30 hover:shadow-sm hover:-translate-y-0.5"
                  }
                `}
              >
                {/* Иконка в цветном кружке */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${opt.bg}`}>
                  {opt.icon}
                </div>

                <div>
                  <p className="text-sm font-semibold leading-tight">{opt.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-tight">
                    {opt.description}
                  </p>
                </div>

                {/* Галочка при выборе */}
                {isSelected && (
                  <span className="absolute top-2 right-2 text-xs font-bold text-primary">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Поле названия появляется после выбора типа */}
        {selected && (
          <div className="mt-2 space-y-1.5 rounded-lg border bg-muted/30 p-3">
            <label className="text-sm font-medium">Название блока</label>
            <Input
              autoFocus
              placeholder={`Например: ${selectedOption?.label}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="bg-background"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-1">
          <Button variant="ghost" onClick={handleClose}>
            Отмена
          </Button>
          <Button onClick={handleAdd} disabled={!selected || loading}>
            {loading ? "Добавляем..." : "Добавить блок"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
