"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";
import { useEffect } from "react";

interface Props {
  content: string;
  onChange?: (html: string) => void;
  editable?: boolean;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  editable = true,
  className,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({ levels: [2, 3] }),
      Link.configure({ openOnClick: false }),
    ],
    content,
    editable,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  // Sync content if it changes externally
  useEffect(() => {
    if (editor && editor.getHTML() !== content && !editor.isFocused) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  if (!editable) {
    return (
      <EditorContent
        editor={editor}
        className={cn(
          "prose prose-blue max-w-none",
          "prose-headings:font-bold prose-p:text-gray-700",
          className
        )}
      />
    );
  }

  return (
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 p-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Жирный"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Курсив"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Заголовок 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Заголовок 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Маркированный список"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Нумерованный список"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Отменить"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Повторить"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Content */}
      <EditorContent
        editor={editor}
        className="min-h-[200px] p-4 prose prose-blue max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[180px]"
      />
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "rounded p-1.5 transition-colors hover:bg-gray-200",
        active && "bg-gray-200 text-blue-600"
      )}
    >
      {children}
    </button>
  );
}
