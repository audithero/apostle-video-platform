import { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import type { JSONContent } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  ImagePlus,
  TableIcon,
  Highlighter,
  Undo,
  Redo,
  RemoveFormatting,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------- Types ----------

interface TipTapEditorProps {
  readonly content?: string | JSONContent | null;
  readonly onChange?: (data: { html: string; json: JSONContent }) => void;
  readonly placeholder?: string;
  readonly className?: string;
  readonly editable?: boolean;
}

// ---------- Toolbar ----------

interface ToolbarProps {
  readonly editor: ReturnType<typeof useEditor>;
}

function EditorToolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const handleImageInsert = useCallback(() => {
    const url = globalThis.prompt("Enter the image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleInsertTable = useCallback(() => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5"
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      {/* Undo / Redo */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label="Undo"
      >
        <Undo className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label="Redo"
      >
        <Redo className="size-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Headings */}
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 1 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        aria-label="Heading 1"
      >
        <Heading1 className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        aria-label="Heading 2"
      >
        <Heading2 className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 3 })}
        onPressedChange={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        aria-label="Heading 3"
      >
        <Heading3 className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Inline formatting */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <Bold className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <Italic className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Strikethrough"
      >
        <Strikethrough className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("code")}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        aria-label="Inline code"
      >
        <Code className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("highlight")}
        onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
        aria-label="Highlight"
      >
        <Highlighter className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Lists */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() =>
          editor.chain().focus().toggleBulletList().run()
        }
        aria-label="Bullet list"
      >
        <List className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() =>
          editor.chain().focus().toggleOrderedList().run()
        }
        aria-label="Ordered list"
      >
        <ListOrdered className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("taskList")}
        onPressedChange={() =>
          editor.chain().focus().toggleTaskList().run()
        }
        aria-label="Task list"
      >
        <ListChecks className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Block elements */}
      <Toggle
        size="sm"
        pressed={editor.isActive("blockquote")}
        onPressedChange={() =>
          editor.chain().focus().toggleBlockquote().run()
        }
        aria-label="Blockquote"
      >
        <Quote className="size-4" />
      </Toggle>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        aria-label="Horizontal rule"
      >
        <Minus className="size-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Image & Table */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleImageInsert}
        aria-label="Insert image"
      >
        <ImagePlus className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleInsertTable}
        aria-label="Insert table"
      >
        <TableIcon className="size-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-5" />

      {/* Clear formatting */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
        aria-label="Clear formatting"
      >
        <RemoveFormatting className="size-4" />
      </Button>
    </div>
  );
}

// ---------- Editor ----------

function TipTapEditor({
  content,
  onChange,
  placeholder = "Start writing your lesson content...",
  className,
  editable = true,
}: TipTapEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Image.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight,
      Typography,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: content ?? "",
    editable,
    onUpdate: ({ editor: ed }) => {
      if (!onChange) return;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onChange({
          html: ed.getHTML(),
          json: ed.getJSON(),
        });
      }, 2_000);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Rich text editor",
      },
    },
  });

  // Sync content from outside when lesson changes
  useEffect(() => {
    if (!editor) return;
    const currentJson = JSON.stringify(editor.getJSON());
    const nextContent = content ?? "";
    // Only reset if the content is materially different (avoids cursor jumps)
    if (typeof nextContent === "string") {
      if (editor.getHTML() !== nextContent) {
        editor.commands.setContent(nextContent, { emitUpdate: false });
      }
    } else {
      if (JSON.stringify(nextContent) !== currentJson) {
        editor.commands.setContent(nextContent, { emitUpdate: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on content identity
  }, [content, editor]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col rounded-md border bg-background overflow-hidden",
        className,
      )}
    >
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
      {editor && (
        <div className="flex items-center justify-end border-t px-3 py-1 text-xs text-muted-foreground">
          {`${editor.storage.characterCount.characters()} characters`}
        </div>
      )}
    </div>
  );
}

export { TipTapEditor };
export type { TipTapEditorProps };
