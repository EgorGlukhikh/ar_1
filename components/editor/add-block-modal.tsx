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
  color: string;
}

const BLOCK_TYPES: BlockTypeOption[] = [
  {
    type: "VIDEO",
    label: "Видео",
    description: "YouTube, Rutube, Яндекс Диск или загрузка",
    icon: <PlayCircle className="h-6 w-6" />,
    color: "text-blue-500 bg-blue-50 border-blue-100",
  },
  {
    type: "TEXT",
    label: "Текст",
    description: "Статья, лекция, форматированный контент",
    icon: <FileText className="h-6 w-6" />,
    color: "text-gray-600 bg-gray-50 border-gray-100",
  },
  {
    type: "QUIZ",
    label: "Тест",
    description: "Вопросы с автоматической проверкой",
    icon: <CheckSquare className="h-6 w-6" />,
    color: "text-green-600 bg-green-50 border-green-100",
  },
  {
    type: "ASSIGNMENT",
    label: "Задание",
    description: "Домашнее задание с проверкой куратором",
    icon: <ClipboardList className="h-6 w-6" />,
    color: "text-orange-500 bg-orange-50 border-orange-100",
  },
  {
    type: "WEBINAR",
    label: "Вебинар",
    description: "Запись эфира или ссылка на трансляцию",
    icon: <Video className="h-6 w-6" />,
    color: "text-purple-500 bg-purple-50 border-purple-100",
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Выберите тип блока</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-3">
          {BLOCK_TYPES.map((opt) => (
            <button
              key={opt.type}
              onClick={() => setSelected(opt.type)}
              className={`
                flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-left transition-all
                ${
                  selected === opt.type
                    ? "border-primary ring-2 ring-primary/20 " + opt.color
                    : "border-transparent " + opt.color + " hover:border-current/30 hover:scale-[1.02]"
                }
              `}
            >
              <div className="self-start">{opt.icon}</div>
              <div className="self-start">
                <p className="text-sm font-semibold leading-tight">{opt.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-tight">
                  {opt.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-3 space-y-2 border-t pt-3">
            <label className="text-sm font-medium">Название блока</label>
            <Input
              autoFocus
              placeholder={`Например: ${selectedOption?.label}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
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
