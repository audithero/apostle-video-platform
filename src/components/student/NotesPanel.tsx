import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StickyNote, Trash2, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotesPanelProps {
  readonly courseId: string;
  readonly lessonId: string;
  readonly getCurrentTimestamp?: () => number | null;
  readonly onSeekToTimestamp?: (seconds: number) => void;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins)}:${String(secs).padStart(2, "0")}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function NotesPanelContent({
  courseId,
  lessonId,
  getCurrentTimestamp,
  onSeekToTimestamp,
}: NotesPanelProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [newNoteContent, setNewNoteContent] = useState("");

  const { data: notes, isLoading } = useQuery(
    trpc.enrollments.getNotes.queryOptions({ courseId, lessonId }),
  );

  const saveMutation = useMutation(
    trpc.enrollments.saveNote.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.enrollments.getNotes.queryKey({ courseId, lessonId }),
        });
        setNewNoteContent("");
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.enrollments.deleteNote.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.enrollments.getNotes.queryKey({ courseId, lessonId }),
        });
      },
    }),
  );

  const handleSaveNote = useCallback(() => {
    if (newNoteContent.trim().length === 0) return;

    const timestampSeconds = getCurrentTimestamp?.() ?? undefined;

    saveMutation.mutate({
      courseId,
      lessonId,
      content: newNoteContent.trim(),
      timestampSeconds,
    });
  }, [newNoteContent, courseId, lessonId, getCurrentTimestamp, saveMutation]);

  const handleDeleteNote = useCallback(
    (noteId: string) => {
      deleteMutation.mutate({ noteId, courseId });
    },
    [courseId, deleteMutation],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSaveNote();
      }
    },
    [handleSaveNote],
  );

  // Display notes newest first
  const sortedNotes = [...(notes ?? [])].reverse();

  return (
    <div className="flex h-full flex-col">
      {/* Note input */}
      <div className="space-y-3 p-4">
        <label htmlFor="new-note-input" className="sr-only">
          Add a new note
        </label>
        <Textarea
          id="new-note-input"
          placeholder="Take a note... (Ctrl+Enter to save)"
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="resize-none text-sm"
        />
        <Button
          type="button"
          size="sm"
          className="w-full"
          disabled={newNoteContent.trim().length === 0 || saveMutation.isPending}
          onClick={handleSaveNote}
        >
          <Plus className="mr-1.5 size-4" />
          {saveMutation.isPending ? "Saving..." : "Add Note"}
        </Button>
      </div>

      <Separator />

      {/* Notes list */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : sortedNotes.length === 0 ? (
            <div className="py-8 text-center">
              <StickyNote className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No notes yet. Start taking notes as you learn.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {sortedNotes.map((note) => (
                <li
                  key={note.id}
                  className="group rounded-lg border p-3 transition-colors hover:bg-accent/30"
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {note.content}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {note.timestampSeconds !== null && note.timestampSeconds !== undefined && (
                        <button
                          type="button"
                          className={cn(
                            "flex items-center gap-1 rounded px-1.5 py-0.5 font-mono transition-colors",
                            onSeekToTimestamp
                              ? "hover:bg-primary/10 hover:text-primary cursor-pointer"
                              : "cursor-default",
                          )}
                          onClick={() => onSeekToTimestamp?.(note.timestampSeconds as number)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onSeekToTimestamp?.(note.timestampSeconds as number);
                            }
                          }}
                        >
                          <Clock className="size-3" />
                          {formatTimestamp(note.timestampSeconds)}
                        </button>
                      )}
                      <time dateTime={new Date(note.createdAt).toISOString()}>
                        {formatDate(new Date(note.createdAt))}
                      </time>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={deleteMutation.isPending}
                      aria-label="Delete note"
                    >
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function NotesPanel(props: NotesPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <StickyNote className="mr-1.5 size-4" />
          Notes
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-96 flex-col p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-left">
            <StickyNote className="size-4" />
            Lesson Notes
          </SheetTitle>
        </SheetHeader>
        <NotesPanelContent {...props} />
      </SheetContent>
    </Sheet>
  );
}
