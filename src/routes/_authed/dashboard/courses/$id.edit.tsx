import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Play,
  FileText,
  HelpCircle,
  ClipboardList,
  Radio,
  Plus,
  MoreHorizontal,
  Trash2,
  Pencil,
  ArrowLeft,
  Upload,
  Save,
  Eye,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TipTapEditor } from "@/components/course/TipTapEditor";
import { AIImageGenerator } from "@/components/course/AIImageGenerator";
import { AIRewriteToolbar } from "@/components/course/AIRewriteToolbar";
import type { CourseContext } from "@/components/course/AIRewriteToolbar";
import type { JSONContent } from "@tiptap/react";
import { CertificatePreview } from "@/components/course/CertificatePreview";
import { useTRPC } from "@/lib/trpc/react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RouteErrorBoundary } from "@/components/error-boundary";

// ---------- Route ----------

export const Route = createFileRoute("/_authed/dashboard/courses/$id/edit")({
  component: CourseBuilderPage,
  errorComponent: RouteErrorBoundary,
});

// ---------- Types ----------

type LessonType = "video" | "text" | "quiz" | "assignment" | "live";

interface LessonData {
  readonly id: string;
  readonly moduleId: string;
  readonly title: string;
  readonly lessonType: LessonType;
  readonly contentHtml: string | null;
  readonly videoUrl: string | null;
  readonly sortOrder: number;
  readonly isFreePreview: boolean;
}

interface ModuleData {
  readonly id: string;
  readonly courseId: string;
  readonly title: string;
  readonly description: string | null;
  readonly sortOrder: number;
  readonly dripDelayDays: number | null;
  readonly dripDate: Date | string | null;
  readonly lessons: ReadonlyArray<LessonData>;
}

interface CourseData {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly thumbnailUrl: string | null;
  readonly status: "draft" | "published" | "archived";
  readonly priceType: "free" | "paid" | "subscription_only";
  readonly priceCents: number | null;
  readonly courseType: "self_paced" | "drip" | "cohort";
  readonly dripIntervalDays: number | null;
  readonly enrollmentCount: number;
  readonly modules: ReadonlyArray<ModuleData>;
}

interface Selection {
  readonly type: "module" | "lesson";
  readonly moduleId: string;
  readonly lessonId?: string;
}

// ---------- Lesson type icons ----------

const LESSON_TYPE_ICONS: Record<LessonType, typeof Play> = {
  video: Play,
  text: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
  live: Radio,
};

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: "Video",
  text: "Text",
  quiz: "Quiz",
  assignment: "Assignment",
  live: "Live",
};

// ---------- Inline Rename ----------

interface InlineRenameProps {
  readonly value: string;
  readonly onSave: (newValue: string) => void;
  readonly className?: string;
}

function InlineRename({ value, onSave, className }: InlineRenameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed.length > 0 && trimmed !== value) {
      onSave(trimmed);
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  }, [editValue, value, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        setEditValue(value);
        setIsEditing(false);
      }
    },
    [handleSave, value],
  );

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleDoubleClickKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsEditing(true);
      }
    },
    [],
  );

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("h-7 text-sm", className)}
        maxLength={200}
        aria-label="Rename item"
      />
    );
  }

  return (
    <span
      className={cn("cursor-default truncate text-sm", className)}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleDoubleClickKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Double-click to rename: ${value}`}
    >
      {value}
    </span>
  );
}

// ---------- Outline Tree - Lesson Item ----------

interface LessonItemProps {
  readonly lesson: LessonData;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
  readonly onRename: (title: string) => void;
  readonly onDelete: () => void;
}

function LessonItem({
  lesson,
  isSelected,
  onSelect,
  onRename,
  onDelete,
}: LessonItemProps) {
  const Icon = LESSON_TYPE_ICONS[lesson.lessonType];

  const handleClick = useCallback(() => {
    onSelect();
  }, [onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    },
    [onSelect],
  );

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition-all cursor-pointer",
        isSelected
          ? "bg-primary/10 text-foreground border border-primary/20"
          : "hover:bg-muted/60 border border-transparent",
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select lesson: ${lesson.title}`}
      aria-pressed={isSelected}
    >
      <GripVertical className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
      <Icon className={cn("size-3.5 shrink-0", isSelected ? "text-gaspar-purple" : "text-muted-foreground")} />
      <InlineRename
        value={lesson.title}
        onSave={onRename}
        className="flex-1 min-w-0"
      />
      {lesson.isFreePreview && (
        <span className="shrink-0 rounded-full bg-gaspar-cream px-2 py-0.5 text-[10px] font-medium text-gaspar-navy">
          Free
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-6 shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Actions for lesson ${lesson.title}`}
          >
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 rounded-xl">
          <DropdownMenuItem onSelect={onDelete}>
            <Trash2 className="size-4" />
            Delete Lesson
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ---------- Outline Tree - Module Item ----------

interface ModuleItemProps {
  readonly module: ModuleData;
  readonly selection: Selection | null;
  readonly onSelectModule: (moduleId: string) => void;
  readonly onSelectLesson: (moduleId: string, lessonId: string) => void;
  readonly onRenameModule: (moduleId: string, title: string) => void;
  readonly onRenameLesson: (lessonId: string, title: string) => void;
  readonly onDeleteModule: (moduleId: string) => void;
  readonly onDeleteLesson: (lessonId: string) => void;
  readonly onAddLesson: (moduleId: string) => void;
}

function ModuleItem({
  module: mod,
  selection,
  onSelectModule,
  onSelectLesson,
  onRenameModule,
  onRenameLesson,
  onDeleteModule,
  onDeleteLesson,
  onAddLesson,
}: ModuleItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  const isModuleSelected =
    selection?.type === "module" && selection.moduleId === mod.id;

  const handleSelectModule = useCallback(() => {
    onSelectModule(mod.id);
  }, [onSelectModule, mod.id]);

  const handleSelectModuleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectModule(mod.id);
      }
    },
    [onSelectModule, mod.id],
  );

  const handleRenameModule = useCallback(
    (title: string) => {
      onRenameModule(mod.id, title);
    },
    [onRenameModule, mod.id],
  );

  const handleDeleteModule = useCallback(() => {
    onDeleteModule(mod.id);
  }, [onDeleteModule, mod.id]);

  const handleAddLesson = useCallback(() => {
    onAddLesson(mod.id);
  }, [onAddLesson, mod.id]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-xl px-1.5 py-2 transition-all",
          isModuleSelected
            ? "bg-primary/10 border border-primary/20"
            : "hover:bg-muted/60 border border-transparent",
        )}
      >
        <GripVertical className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-6 shrink-0 rounded-full"
            aria-label={isOpen ? "Collapse module" : "Expand module"}
          >
            {isOpen ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </Button>
        </CollapsibleTrigger>
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handleSelectModule}
          onKeyDown={handleSelectModuleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`Select module: ${mod.title}`}
        >
          <InlineRename
            value={mod.title}
            onSave={handleRenameModule}
            className="font-heading font-semibold"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6 shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Actions for module ${mod.title}`}
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            <DropdownMenuItem onSelect={handleAddLesson}>
              <Plus className="size-4" />
              Add Lesson
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={handleDeleteModule}>
              <Trash2 className="size-4" />
              Delete Module
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CollapsibleContent>
        <div className="ml-5 mt-1 space-y-1 border-l border-border/50 pl-2">
          {mod.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isSelected={
                selection?.type === "lesson" &&
                selection.lessonId === lesson.id
              }
              onSelect={() => onSelectLesson(mod.id, lesson.id)}
              onRename={(title) => onRenameLesson(lesson.id, title)}
              onDelete={() => onDeleteLesson(lesson.id)}
            />
          ))}
          {mod.lessons.length === 0 && (
            <p className="px-2 py-2 text-xs text-muted-foreground italic">
              No lessons yet
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ---------- Left Panel: Course Outline ----------

interface CourseOutlinePanelProps {
  readonly course: CourseData;
  readonly selection: Selection | null;
  readonly onSelectModule: (moduleId: string) => void;
  readonly onSelectLesson: (moduleId: string, lessonId: string) => void;
  readonly onRenameModule: (moduleId: string, title: string) => void;
  readonly onRenameLesson: (lessonId: string, title: string) => void;
  readonly onDeleteModule: (moduleId: string) => void;
  readonly onDeleteLesson: (lessonId: string) => void;
  readonly onAddModule: () => void;
  readonly onAddLesson: (moduleId: string) => void;
}

function CourseOutlinePanel({
  course,
  selection,
  onSelectModule,
  onSelectLesson,
  onRenameModule,
  onRenameLesson,
  onDeleteModule,
  onDeleteLesson,
  onAddModule,
  onAddLesson,
}: CourseOutlinePanelProps) {
  return (
    <div className="flex h-full flex-col bg-card/50">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <h2 className="font-heading text-sm font-bold tracking-tight">Course Outline</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full text-xs"
          onClick={onAddModule}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onAddModule();
            }
          }}
          aria-label="Add new module"
        >
          <Plus className="size-4" />
          Module
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1.5 p-3">
          {course.modules.map((mod) => (
            <ModuleItem
              key={mod.id}
              module={mod}
              selection={selection}
              onSelectModule={onSelectModule}
              onSelectLesson={onSelectLesson}
              onRenameModule={onRenameModule}
              onRenameLesson={onRenameLesson}
              onDeleteModule={onDeleteModule}
              onDeleteLesson={onDeleteLesson}
              onAddLesson={onAddLesson}
            />
          ))}
          {course.modules.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-gaspar-lavender/15">
                <Plus className="size-5 text-gaspar-purple" />
              </div>
              <p className="text-sm text-muted-foreground">
                No modules yet. Add your first module to get started.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={onAddModule}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAddModule();
                  }
                }}
                aria-label="Add your first module"
              >
                <Plus className="size-4" />
                Add Module
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ---------- Center Panel: Content Editor ----------

interface TextLessonEditorProps {
  readonly lesson: LessonData;
  readonly courseContext: CourseContext;
  readonly onSaveContent: (html: string, json: JSONContent) => void;
  readonly isSaving: boolean;
}

function TextLessonEditor({ lesson, courseContext, onSaveContent, isSaving }: TextLessonEditorProps) {
  const [editorContent, setEditorContent] = useState<string>(lesson.contentHtml ?? "");
  const [editorKey, setEditorKey] = useState(0);

  // Track current content for AI rewrite
  const handleChange = useCallback(
    (data: { html: string; json: JSONContent }) => {
      setEditorContent(data.html);
      onSaveContent(data.html, data.json);
    },
    [onSaveContent],
  );

  // When AI rewrite is accepted, update editor content and trigger save
  const handleAcceptRewrite = useCallback(
    (html: string) => {
      setEditorContent(html);
      // Force TipTap to re-render with new content by changing key
      setEditorKey((prev) => prev + 1);
      // Save immediately
      onSaveContent(html, { type: "doc", content: [] });
    },
    [onSaveContent],
  );

  // Sync when lesson changes
  useEffect(() => {
    setEditorContent(lesson.contentHtml ?? "");
  }, [lesson.id, lesson.contentHtml]);

  return (
    <div className="flex h-full flex-col gap-3 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-muted-foreground">Text Content</h3>
        {isSaving && (
          <span className="text-xs text-muted-foreground" aria-live="polite">
            Saving...
          </span>
        )}
      </div>
      <AIRewriteToolbar
        currentContent={editorContent}
        courseContext={courseContext}
        onAcceptRewrite={handleAcceptRewrite}
      />
      <TipTapEditor
        key={editorKey}
        content={editorContent}
        onChange={handleChange}
        className="flex-1"
      />
    </div>
  );
}

function VideoLessonEditor({ lesson }: { readonly lesson: LessonData }) {
  return (
    <div className="flex h-full flex-col gap-3 p-6">
      <h3 className="font-heading text-sm font-semibold text-muted-foreground">Video Content</h3>
      {lesson.videoUrl ? (
        <div className="flex flex-col gap-3">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-black">
            <video
              src={lesson.videoUrl}
              controls
              className="size-full"
              aria-label={`Video for lesson: ${lesson.title}`}
            />
            {/* Captions track will be added when caption uploads are supported */}
          </div>
          <p className="text-sm text-muted-foreground">
            Video uploaded successfully. You can replace it by uploading a new file.
          </p>
        </div>
      ) : (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border/40 bg-muted/20 p-8"
          role="region"
          aria-label="Video upload area"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-gaspar-lavender/15">
            <Upload className="size-6 text-gaspar-purple" />
          </div>
          <div className="text-center">
            <p className="font-heading text-sm font-semibold">Upload a video</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Drag and drop a video file here, or click to browse.
              Supports MP4, MOV, and WebM.
            </p>
          </div>
          <Button type="button" variant="outline" className="rounded-full" aria-label="Browse for video file">
            <Upload className="size-4" />
            Choose File
          </Button>
        </div>
      )}
    </div>
  );
}

function QuizLessonEditor({ lesson }: { readonly lesson: LessonData }) {
  return (
    <div className="flex h-full flex-col gap-3 p-6">
      <h3 className="font-heading text-sm font-semibold text-muted-foreground">
        {`Quiz: ${lesson.title}`}
      </h3>
      <div
        className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border/40 bg-muted/20 p-8"
        role="region"
        aria-label="Quiz builder area"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-gaspar-pink/20">
          <HelpCircle className="size-6 text-gaspar-purple" />
        </div>
        <div className="text-center">
          <p className="font-heading text-sm font-semibold">Quiz Builder</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create multiple choice, true/false, and short answer questions
            for this lesson.
          </p>
        </div>
        <Button type="button" variant="outline" className="rounded-full" aria-label="Start building quiz">
          <Plus className="size-4" />
          Add Question
        </Button>
      </div>
    </div>
  );
}

function PlaceholderEditor({ lesson }: { readonly lesson: LessonData }) {
  const label = LESSON_TYPE_LABELS[lesson.lessonType];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <div className="flex size-14 items-center justify-center rounded-full bg-gaspar-cream/50">
        <Pencil className="size-6 text-gaspar-navy" />
      </div>
      <p className="text-sm text-muted-foreground">
        {`${label} editor coming soon`}
      </p>
    </div>
  );
}

function LessonPreview({ lesson }: { readonly lesson: LessonData }) {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="pill border-gaspar-purple/20 bg-gaspar-lavender/15 text-gaspar-purple">
          {LESSON_TYPE_LABELS[lesson.lessonType]}
        </span>
        <h3 className="font-heading text-lg font-bold tracking-tight">{lesson.title}</h3>
      </div>
      {lesson.lessonType === "video" && lesson.videoUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
          <video
            src={lesson.videoUrl}
            controls
            className="size-full"
            aria-label={`Video preview: ${lesson.title}`}
          >
            <track kind="captions" label="Captions" />
          </video>
        </div>
      ) : null}
      {lesson.contentHtml ? (
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
        />
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No content yet. Switch back to the editor to add content.
        </p>
      )}
    </div>
  );
}

interface ContentEditorPanelProps {
  readonly selection: Selection | null;
  readonly course: CourseData;
  readonly courseContext: CourseContext;
  readonly onSaveContent: (lessonId: string, html: string, json: JSONContent) => void;
  readonly isSavingContent: boolean;
  readonly isPreviewMode: boolean;
}

function ContentEditorPanel({
  selection,
  course,
  courseContext,
  onSaveContent,
  isSavingContent,
  isPreviewMode,
}: ContentEditorPanelProps) {
  if (!selection || selection.type === "module") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-8">
        <div className="flex size-16 items-center justify-center rounded-full bg-gaspar-lavender/15">
          <FileText className="size-7 text-gaspar-purple" />
        </div>
        <div>
          <p className="font-heading text-base font-semibold">Select a lesson to edit</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a lesson from the outline on the left to start editing its content.
          </p>
        </div>
      </div>
    );
  }

  const selectedModule = course.modules.find(
    (m) => m.id === selection.moduleId,
  );
  const selectedLesson = selectedModule?.lessons.find(
    (l) => l.id === selection.lessonId,
  );

  if (!selectedLesson) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Lesson not found</p>
      </div>
    );
  }

  if (isPreviewMode) {
    return <LessonPreview lesson={selectedLesson} />;
  }

  const handleSaveContent = (html: string, json: JSONContent) => {
    onSaveContent(selectedLesson.id, html, json);
  };

  switch (selectedLesson.lessonType) {
    case "text": {
      return (
        <TextLessonEditor
          lesson={selectedLesson}
          courseContext={courseContext}
          onSaveContent={handleSaveContent}
          isSaving={isSavingContent}
        />
      );
    }
    case "video": {
      return <VideoLessonEditor lesson={selectedLesson} />;
    }
    case "quiz": {
      return <QuizLessonEditor lesson={selectedLesson} />;
    }
    default: {
      return <PlaceholderEditor lesson={selectedLesson} />;
    }
  }
}

// ---------- Right Panel: Settings ----------

interface CourseSettingsPanelProps {
  readonly course: CourseData;
  readonly onUpdateCourse: (updates: {
    title?: string;
    description?: string;
    status?: "draft" | "published" | "archived";
    priceType?: "free" | "paid" | "subscription_only";
    priceCents?: number;
    courseType?: "self_paced" | "drip" | "cohort";
    dripIntervalDays?: number;
    thumbnailUrl?: string;
  }) => void;
  readonly isSaving: boolean;
}

function CourseSettingsPanel({
  course,
  onUpdateCourse,
  isSaving,
}: CourseSettingsPanelProps) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [status, setStatus] = useState(course.status);
  const [priceType, setPriceType] = useState(course.priceType);
  const [courseType, setCourseType] = useState(course.courseType);
  const [dripIntervalDays, setDripIntervalDays] = useState(
    String(course.dripIntervalDays ?? 7),
  );
  const [priceAmount, setPriceAmount] = useState(
    ((course.priceCents ?? 0) / 100).toFixed(2),
  );

  useEffect(() => {
    setTitle(course.title);
    setDescription(course.description ?? "");
    setStatus(course.status);
    setPriceType(course.priceType);
    setCourseType(course.courseType);
    setDripIntervalDays(String(course.dripIntervalDays ?? 7));
    setPriceAmount(((course.priceCents ?? 0) / 100).toFixed(2));
  }, [course.id, course.title, course.description, course.status, course.priceType, course.priceCents, course.courseType, course.dripIntervalDays]);

  const handleSave = useCallback(() => {
    const priceCents = Math.round(Number.parseFloat(priceAmount) * 100);
    onUpdateCourse({
      title,
      description: description.length > 0 ? description : undefined,
      status,
      priceType,
      courseType,
      dripIntervalDays: courseType === "drip" ? Number.parseInt(dripIntervalDays, 10) || 7 : undefined,
      priceCents: Number.isNaN(priceCents) ? 0 : priceCents,
    });
  }, [title, description, status, priceType, courseType, dripIntervalDays, priceAmount, onUpdateCourse]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold tracking-tight">Course Settings</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
          disabled={isSaving}
          aria-label="Save course settings"
        >
          <Save className="size-3.5" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="course-settings-title" className="text-xs font-medium">Title</Label>
        <Input
          id="course-settings-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="rounded-xl"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="course-settings-description" className="text-xs font-medium">Description</Label>
        <Textarea
          id="course-settings-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your course..."
          className="min-h-[80px] rounded-xl"
        />
      </div>

      <Separator />

      {/* AI Thumbnail Generator */}
      <AIImageGenerator
        defaultDescription={course.title}
        currentImageUrl={course.thumbnailUrl}
        onAccept={(url) => onUpdateCourse({ thumbnailUrl: url })}
        label="Thumbnail"
      />

      <Separator />

      <div className="grid gap-2">
        <Label htmlFor="course-settings-status" className="text-xs font-medium">Status</Label>
        <Select
          value={status}
          onValueChange={(val) =>
            setStatus(val as "draft" | "published" | "archived")
          }
        >
          <SelectTrigger id="course-settings-status" className="w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-border/50" />

      <div className="grid gap-2">
        <Label htmlFor="course-settings-price-type" className="text-xs font-medium">Price Type</Label>
        <Select
          value={priceType}
          onValueChange={(val) =>
            setPriceType(val as "free" | "paid" | "subscription_only")
          }
        >
          <SelectTrigger id="course-settings-price-type" className="w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid (One-Time)</SelectItem>
            <SelectItem value="subscription_only">Subscription Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {priceType === "paid" && (
        <div className="grid gap-2">
          <Label htmlFor="course-settings-price" className="text-xs font-medium">Price (USD)</Label>
          <Input
            id="course-settings-price"
            type="number"
            min="0"
            step="0.01"
            value={priceAmount}
            onChange={(e) => setPriceAmount(e.target.value)}
            placeholder="0.00"
            className="rounded-xl"
          />
        </div>
      )}

      <Separator className="bg-border/50" />

      <div className="grid gap-2">
        <Label htmlFor="course-settings-type" className="text-xs font-medium">Course Type</Label>
        <Select
          value={courseType}
          onValueChange={(val) =>
            setCourseType(val as "self_paced" | "drip" | "cohort")
          }
        >
          <SelectTrigger id="course-settings-type" className="w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="self_paced">Self-Paced</SelectItem>
            <SelectItem value="drip">Drip (Scheduled Release)</SelectItem>
            <SelectItem value="cohort">Cohort (Date-Based)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {courseType === "self_paced" && "All content is available immediately after enrollment."}
          {courseType === "drip" && "Modules unlock on a schedule after enrollment. Set delay days per module."}
          {courseType === "cohort" && "Modules unlock on specific dates. Set unlock dates per module."}
        </p>
      </div>

      {courseType === "drip" && (
        <div className="grid gap-2">
          <Label htmlFor="course-settings-drip-interval" className="text-xs font-medium">Default Drip Interval (days)</Label>
          <Input
            id="course-settings-drip-interval"
            type="number"
            min="1"
            max="365"
            value={dripIntervalDays}
            onChange={(e) => setDripIntervalDays(e.target.value)}
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            Default days between module releases. Override per module in module settings.
          </p>
        </div>
      )}
    </div>
  );
}

interface LessonSettingsPanelProps {
  readonly lesson: LessonData;
  readonly onUpdateLesson: (updates: {
    id: string;
    title?: string;
    lessonType?: LessonType;
    isFreePreview?: boolean;
  }) => void;
  readonly isSaving: boolean;
}

function LessonSettingsPanel({
  lesson,
  onUpdateLesson,
  isSaving,
}: LessonSettingsPanelProps) {
  const [title, setTitle] = useState(lesson.title);
  const [lessonType, setLessonType] = useState(lesson.lessonType);
  const [isFreePreview, setIsFreePreview] = useState(lesson.isFreePreview);

  useEffect(() => {
    setTitle(lesson.title);
    setLessonType(lesson.lessonType);
    setIsFreePreview(lesson.isFreePreview);
  }, [lesson.id, lesson.title, lesson.lessonType, lesson.isFreePreview]);

  const handleSave = useCallback(() => {
    onUpdateLesson({
      id: lesson.id,
      title,
      lessonType,
      isFreePreview,
    });
  }, [lesson.id, title, lessonType, isFreePreview, onUpdateLesson]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold tracking-tight">Lesson Settings</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
          disabled={isSaving}
          aria-label="Save lesson settings"
        >
          <Save className="size-3.5" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="lesson-settings-title" className="text-xs font-medium">Title</Label>
        <Input
          id="lesson-settings-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="rounded-xl"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="lesson-settings-type" className="text-xs font-medium">Lesson Type</Label>
        <Select
          value={lessonType}
          onValueChange={(val) => setLessonType(val as LessonType)}
        >
          <SelectTrigger id="lesson-settings-type" className="w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="quiz">Quiz</SelectItem>
            <SelectItem value="assignment">Assignment</SelectItem>
            <SelectItem value="live">Live</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-border/50" />

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="lesson-free-preview" className="text-xs font-medium">Free Preview</Label>
          <p className="text-xs text-muted-foreground">
            Allow non-enrolled students to preview this lesson
          </p>
        </div>
        <Switch
          id="lesson-free-preview"
          checked={isFreePreview}
          onCheckedChange={setIsFreePreview}
          aria-label="Toggle free preview"
        />
      </div>
    </div>
  );
}

// ---------- Module Drip Settings ----------

interface ModuleDripSettingsPanelProps {
  readonly module: ModuleData;
  readonly courseType: "drip" | "cohort";
  readonly moduleIndex: number;
  readonly defaultIntervalDays: number;
  readonly onUpdateModule: (updates: {
    id: string;
    dripDelayDays?: number;
    dripDate?: string;
  }) => void;
  readonly isSaving: boolean;
}

function ModuleDripSettingsPanel({
  module: mod,
  courseType,
  moduleIndex,
  defaultIntervalDays,
  onUpdateModule,
  isSaving,
}: ModuleDripSettingsPanelProps) {
  const [delayDays, setDelayDays] = useState(
    String(mod.dripDelayDays ?? moduleIndex * defaultIntervalDays),
  );
  const [dripDate, setDripDate] = useState(
    mod.dripDate
      ? new Date(mod.dripDate).toISOString().slice(0, 10)
      : "",
  );

  useEffect(() => {
    setDelayDays(String(mod.dripDelayDays ?? moduleIndex * defaultIntervalDays));
    setDripDate(
      mod.dripDate
        ? new Date(mod.dripDate).toISOString().slice(0, 10)
        : "",
    );
  }, [mod.id, mod.dripDelayDays, mod.dripDate, moduleIndex, defaultIntervalDays]);

  const handleSave = useCallback(() => {
    if (courseType === "drip") {
      onUpdateModule({
        id: mod.id,
        dripDelayDays: Number.parseInt(delayDays, 10) || 0,
      });
    } else {
      onUpdateModule({
        id: mod.id,
        dripDate: dripDate.length > 0 ? new Date(dripDate).toISOString() : undefined,
      });
    }
  }, [courseType, mod.id, delayDays, dripDate, onUpdateModule]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-heading text-sm font-bold tracking-tight">
          <Clock className="size-3.5 text-gaspar-purple" />
          Drip Schedule
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
          disabled={isSaving}
          aria-label="Save drip settings"
        >
          <Save className="size-3.5" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {`Configure when "${mod.title}" becomes available to students.`}
      </p>

      {courseType === "drip" && (
        <div className="grid gap-2">
          <Label htmlFor="module-drip-delay" className="text-xs font-medium">Days After Enrollment</Label>
          <Input
            id="module-drip-delay"
            type="number"
            min="0"
            max="365"
            value={delayDays}
            onChange={(e) => setDelayDays(e.target.value)}
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            {Number.parseInt(delayDays, 10) === 0
              ? "Available immediately on enrollment."
              : `Unlocks ${delayDays} day${Number.parseInt(delayDays, 10) === 1 ? "" : "s"} after student enrolls.`}
          </p>
        </div>
      )}

      {courseType === "cohort" && (
        <div className="grid gap-2">
          <Label htmlFor="module-drip-date" className="text-xs font-medium">Unlock Date</Label>
          <Input
            id="module-drip-date"
            type="date"
            value={dripDate}
            onChange={(e) => setDripDate(e.target.value)}
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            {dripDate.length > 0
              ? `Module unlocks on ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(dripDate))}.`
              : "No unlock date set. Module is available immediately."}
          </p>
        </div>
      )}
    </div>
  );
}

interface SettingsPanelProps {
  readonly selection: Selection | null;
  readonly course: CourseData;
  readonly onUpdateCourse: (updates: {
    title?: string;
    description?: string;
    status?: "draft" | "published" | "archived";
    priceType?: "free" | "paid" | "subscription_only";
    priceCents?: number;
    courseType?: "self_paced" | "drip" | "cohort";
    dripIntervalDays?: number;
    thumbnailUrl?: string;
  }) => void;
  readonly onUpdateModule: (updates: {
    id: string;
    dripDelayDays?: number;
    dripDate?: string;
  }) => void;
  readonly onUpdateLesson: (updates: {
    id: string;
    title?: string;
    lessonType?: LessonType;
    isFreePreview?: boolean;
  }) => void;
  readonly isUpdatingCourse: boolean;
  readonly isUpdatingModule: boolean;
  readonly isUpdatingLesson: boolean;
}

function SettingsPanel({
  selection,
  course,
  onUpdateCourse,
  onUpdateModule,
  onUpdateLesson,
  isUpdatingCourse,
  isUpdatingModule,
  isUpdatingLesson,
}: SettingsPanelProps) {
  const selectedModule = selection
    ? course.modules.find((m) => m.id === selection.moduleId) ?? null
    : null;

  const selectedLesson = (() => {
    if (selection?.type !== "lesson" || !selection.lessonId) return null;
    const mod = course.modules.find((m) => m.id === selection.moduleId);
    return mod?.lessons.find((l) => l.id === selection.lessonId) ?? null;
  })();

  return (
    <div className="flex h-full flex-col bg-card/50">
      <div className="border-b border-border/50 px-4 py-3">
        <h2 className="font-heading text-sm font-bold tracking-tight">Settings</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          <CourseSettingsPanel
            course={course}
            onUpdateCourse={onUpdateCourse}
            isSaving={isUpdatingCourse}
          />

          {selectedModule && (course.courseType === "drip" || course.courseType === "cohort") && (
            <>
              <Separator />
              <ModuleDripSettingsPanel
                module={selectedModule}
                courseType={course.courseType}
                moduleIndex={course.modules.findIndex((m) => m.id === selectedModule.id)}
                defaultIntervalDays={course.dripIntervalDays ?? 7}
                onUpdateModule={onUpdateModule}
                isSaving={isUpdatingModule}
              />
            </>
          )}

          {selectedLesson && (
            <>
              <Separator />
              <LessonSettingsPanel
                lesson={selectedLesson}
                onUpdateLesson={onUpdateLesson}
                isSaving={isUpdatingLesson}
              />
            </>
          )}

          <Separator />
          <CertificateConfigPanel courseId={course.id} />
        </div>
      </ScrollArea>
    </div>
  );
}

// ---------- Certificate Config Panel ----------

interface CertificateConfigPanelProps {
  readonly courseId: string;
}

function CertificateConfigPanel({ courseId }: CertificateConfigPanelProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: certConfig, isLoading } = useQuery(
    trpc.certificates.getByCourse.queryOptions({ courseId }),
  );

  const upsertMutation = useMutation(
    trpc.certificates.upsert.mutationOptions({
      onSuccess: () => {
        toast.success("Certificate settings saved");
        queryClient.invalidateQueries({
          queryKey: trpc.certificates.getByCourse.queryKey({ courseId }),
        });
      },
      onError: () => {
        toast.error("Failed to save certificate settings");
      },
    }),
  );

  const [certTitle, setCertTitle] = useState("Certificate of Completion");
  const [certSubtitle, setCertSubtitle] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [includeDate, setIncludeDate] = useState(true);
  const [includeSerial, setIncludeSerial] = useState(true);

  useEffect(() => {
    if (certConfig) {
      setCertTitle(certConfig.title ?? "Certificate of Completion");
      setCertSubtitle(certConfig.subtitle ?? "");
      setLogoUrl(certConfig.logoUrl ?? "");
      setBgImageUrl(certConfig.backgroundImageUrl ?? "");
      setIncludeDate(certConfig.includeDate);
      setIncludeSerial(certConfig.includeSerial);
    }
  }, [certConfig]);

  const handleSave = useCallback(() => {
    upsertMutation.mutate({
      courseId,
      title: certTitle,
      subtitle: certSubtitle.length > 0 ? certSubtitle : undefined,
      logoUrl: logoUrl.length > 0 ? logoUrl : undefined,
      backgroundImageUrl: bgImageUrl.length > 0 ? bgImageUrl : undefined,
      includeDate,
      includeSerial,
    });
  }, [courseId, certTitle, certSubtitle, logoUrl, bgImageUrl, includeDate, includeSerial, upsertMutation]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Award className="size-4 text-gaspar-purple" />
          <h3 className="font-heading text-sm font-bold tracking-tight">Certificate</h3>
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="size-4 text-gaspar-purple" />
          <h3 className="font-heading text-sm font-bold tracking-tight">Certificate</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={handleSave}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSave(); } }}
          disabled={upsertMutation.isPending}
          aria-label="Save certificate settings"
        >
          <Save className="size-3.5" />
          {upsertMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Students receive a certificate when they complete all lessons.
      </p>

      <div className="grid gap-2">
        <Label htmlFor="cert-title" className="text-xs font-medium">Certificate Title</Label>
        <Input
          id="cert-title"
          value={certTitle}
          onChange={(e) => setCertTitle(e.target.value)}
          placeholder="Certificate of Completion"
          maxLength={200}
          className="rounded-xl"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cert-subtitle" className="text-xs font-medium">Subtitle (optional)</Label>
        <Input
          id="cert-subtitle"
          value={certSubtitle}
          onChange={(e) => setCertSubtitle(e.target.value)}
          placeholder="For outstanding achievement in..."
          maxLength={300}
          className="rounded-xl"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cert-logo" className="text-xs font-medium">Logo URL (optional)</Label>
        <Input
          id="cert-logo"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://..."
          className="rounded-xl"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cert-bg" className="text-xs font-medium">Background Image URL (optional)</Label>
        <Input
          id="cert-bg"
          value={bgImageUrl}
          onChange={(e) => setBgImageUrl(e.target.value)}
          placeholder="https://..."
          className="rounded-xl"
        />
      </div>

      <Separator className="bg-border/50" />

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="cert-include-date" className="text-xs font-medium">Include Completion Date</Label>
          <p className="text-xs text-muted-foreground">Show when the student completed</p>
        </div>
        <Switch
          id="cert-include-date"
          checked={includeDate}
          onCheckedChange={setIncludeDate}
          aria-label="Toggle include completion date"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="cert-include-serial" className="text-xs font-medium">Include Serial Number</Label>
          <p className="text-xs text-muted-foreground">Add a unique serial for verification</p>
        </div>
        <Switch
          id="cert-include-serial"
          checked={includeSerial}
          onCheckedChange={setIncludeSerial}
          aria-label="Toggle include serial number"
        />
      </div>

      {/* Certificate Preview Card */}
      <CertificatePreview
        title={certTitle}
        subtitle={certSubtitle}
        logoUrl={logoUrl}
        backgroundImageUrl={bgImageUrl}
        includeDate={includeDate}
        includeSerial={includeSerial}
      />
    </div>
  );
}

// ---------- Loading Skeleton ----------

function CourseBuilderSkeleton() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-5 w-48" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <div className="flex flex-1">
        <div className="w-72 border-r p-3 space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="w-72 border-l p-3 space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

// ---------- Main Page Component ----------

function CourseBuilderPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const isMobile = useIsMobile();

  // ---------- State ----------
  const [selection, setSelection] = useState<Selection | null>(null);
  const [mobileTab, setMobileTab] = useState<string>("outline");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // ---------- Queries ----------
  const courseQuery = useQuery(
    trpc.courses.getById.queryOptions({ id }),
  );

  // ---------- Mutations ----------
  const updateCourseMutation = useMutation(
    trpc.courses.update.mutationOptions({
      onSuccess: () => {
        toast.success("Course updated");
        queryClient.invalidateQueries({
          queryKey: trpc.courses.getById.queryKey({ id }),
        });
      },
      onError: () => {
        toast.error("Failed to update course");
      },
    }),
  );

  const createModuleMutation = useMutation(
    trpc.modules.create.mutationOptions({
      onSuccess: () => {
        toast.success("Module added");
        queryClient.invalidateQueries({
          queryKey: trpc.courses.getById.queryKey({ id }),
        });
      },
      onError: () => {
        toast.error("Failed to add module");
      },
    }),
  );

  const updateModuleMutation = useMutation(
    trpc.modules.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.courses.getById.queryKey({ id }),
        });
      },
      onError: () => {
        toast.error("Failed to update module");
      },
    }),
  );

  const deleteModuleMutation = useMutation(
    trpc.modules.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Module deleted");
        setSelection(null);
        queryClient.invalidateQueries({
          queryKey: trpc.courses.getById.queryKey({ id }),
        });
      },
      onError: () => {
        toast.error("Failed to delete module");
      },
    }),
  );

  const createLessonMutation = useMutation(
    trpc.lessons.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Lesson added");
        queryClient.invalidateQueries({
          queryKey: trpc.courses.getById.queryKey({ id }),
        });
        if (data) {
          setSelection({
            type: "lesson",
            moduleId: data.moduleId,
            lessonId: data.id,
          });
        }
      },
      onError: () => {
        toast.error("Failed to add lesson");
      },
    }),
  );

  const updateLessonMutation = useMutation(
    trpc.lessons.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.courses.getById.queryKey({ id }),
        });
      },
      onError: () => {
        toast.error("Failed to update lesson");
      },
    }),
  );

  const updateContentMutation = useMutation(
    trpc.lessons.updateContent.mutationOptions({
      onSuccess: () => {
        toast.success("Content saved");
        queryClient.invalidateQueries({
          queryKey: trpc.courses.getById.queryKey({ id }),
        });
      },
      onError: () => {
        toast.error("Failed to save content");
      },
    }),
  );

  const deleteLessonMutation = useMutation(
    trpc.lessons.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Lesson deleted");
        setSelection(null);
        queryClient.invalidateQueries({
          queryKey: trpc.courses.getById.queryKey({ id }),
        });
      },
      onError: () => {
        toast.error("Failed to delete lesson");
      },
    }),
  );

  // ---------- Handlers ----------
  const handleSelectModule = useCallback((moduleId: string) => {
    setSelection({ type: "module", moduleId });
  }, []);

  const handleSelectLesson = useCallback(
    (moduleId: string, lessonId: string) => {
      setSelection({ type: "lesson", moduleId, lessonId });
    },
    [],
  );

  const handleAddModule = useCallback(() => {
    createModuleMutation.mutate({
      courseId: id,
      title: "New Module",
    });
  }, [createModuleMutation, id]);

  const handleRenameModule = useCallback(
    (moduleId: string, title: string) => {
      updateModuleMutation.mutate({ id: moduleId, title });
    },
    [updateModuleMutation],
  );

  const handleDeleteModule = useCallback(
    (moduleId: string) => {
      deleteModuleMutation.mutate({ id: moduleId });
    },
    [deleteModuleMutation],
  );

  const handleAddLesson = useCallback(
    (moduleId: string) => {
      createLessonMutation.mutate({
        moduleId,
        title: "New Lesson",
        lessonType: "text",
      });
    },
    [createLessonMutation],
  );

  const handleRenameLesson = useCallback(
    (lessonId: string, title: string) => {
      updateLessonMutation.mutate({ id: lessonId, title });
    },
    [updateLessonMutation],
  );

  const handleDeleteLesson = useCallback(
    (lessonId: string) => {
      deleteLessonMutation.mutate({ id: lessonId });
    },
    [deleteLessonMutation],
  );

  const handleUpdateCourse = useCallback(
    (updates: {
      title?: string;
      description?: string;
      status?: "draft" | "published" | "archived";
      priceType?: "free" | "paid" | "subscription_only";
      priceCents?: number;
      courseType?: "self_paced" | "drip" | "cohort";
      dripIntervalDays?: number;
      thumbnailUrl?: string;
    }) => {
      updateCourseMutation.mutate({ id, ...updates });
    },
    [updateCourseMutation, id],
  );

  const handleUpdateModuleDrip = useCallback(
    (updates: { id: string; dripDelayDays?: number; dripDate?: string }) => {
      updateModuleMutation.mutate(updates);
    },
    [updateModuleMutation],
  );

  const handleUpdateLesson = useCallback(
    (updates: {
      id: string;
      title?: string;
      lessonType?: LessonType;
      isFreePreview?: boolean;
    }) => {
      updateLessonMutation.mutate(updates);
    },
    [updateLessonMutation],
  );

  const handleSaveContent = useCallback(
    (lessonId: string, html: string, json: JSONContent) => {
      updateContentMutation.mutate({
        id: lessonId,
        contentHtml: html,
        contentJson: json,
      });
    },
    [updateContentMutation],
  );

  // ---------- Render ----------
  if (courseQuery.isLoading) {
    return <CourseBuilderSkeleton />;
  }

  const course = courseQuery.data;

  if (!course) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Course not found</p>
        <Button type="button" asChild>
          <Link to="/dashboard/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  const courseContext: CourseContext = {
    title: course.title,
    description: course.description ?? "",
    level: "intermediate",
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col -my-6 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Top toolbar */}
      <header className="flex items-center gap-3 border-b border-border/50 bg-card/80 px-4 py-2.5 backdrop-blur-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full"
          asChild
        >
          <Link to="/dashboard/courses" aria-label="Back to courses list">
            <ArrowLeft className="size-4" />
            Courses
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-5 bg-border/50" />
        <h1 className="truncate font-heading text-sm font-bold tracking-tight">{course.title}</h1>
        <span className={cn(
          "pill shrink-0",
          course.status === "published"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            : course.status === "draft"
              ? "border-border bg-muted text-muted-foreground"
              : "border-border bg-muted/50 text-muted-foreground",
        )}>
          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
        </span>
        <span className="text-xs text-muted-foreground">
          {`${course.enrollmentCount} enrolled`}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setIsPreviewMode((prev) => !prev)}
            aria-label={isPreviewMode ? "Switch to editor" : "Preview lesson content"}
            aria-pressed={isPreviewMode}
          >
            {isPreviewMode ? (
              <>
                <Pencil className="size-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="size-4" />
                Preview
              </>
            )}
          </Button>
          {course.status === "draft" && (
            <Button
              type="button"
              size="sm"
              className="rounded-full bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90"
              onClick={() => handleUpdateCourse({ status: "published" })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUpdateCourse({ status: "published" });
                }
              }}
              disabled={updateCourseMutation.isPending}
            >
              Publish
            </Button>
          )}
        </div>
      </header>

      {/* Three-panel layout (desktop) / Tab layout (mobile) */}
      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          <Tabs
            value={mobileTab}
            onValueChange={setMobileTab}
            className="flex h-full flex-col"
          >
            <TabsList className="mx-2 mt-2 w-[calc(100%-1rem)] rounded-full bg-muted/60 p-1">
              <TabsTrigger value="outline" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Outline</TabsTrigger>
              <TabsTrigger value="editor" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Editor</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="outline" className="flex-1 overflow-hidden">
              <CourseOutlinePanel
                course={course as CourseData}
                selection={selection}
                onSelectModule={handleSelectModule}
                onSelectLesson={(moduleId, lessonId) => {
                  handleSelectLesson(moduleId, lessonId);
                  setMobileTab("editor");
                }}
                onRenameModule={handleRenameModule}
                onRenameLesson={handleRenameLesson}
                onDeleteModule={handleDeleteModule}
                onDeleteLesson={handleDeleteLesson}
                onAddModule={handleAddModule}
                onAddLesson={handleAddLesson}
              />
            </TabsContent>
            <TabsContent value="editor" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <ContentEditorPanel
                  selection={selection}
                  course={course as CourseData}
                  courseContext={courseContext}
                  onSaveContent={handleSaveContent}
                  isSavingContent={updateContentMutation.isPending}
                  isPreviewMode={isPreviewMode}
                />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="settings" className="flex-1 overflow-hidden">
              <SettingsPanel
                selection={selection}
                course={course as CourseData}
                onUpdateCourse={handleUpdateCourse}
                onUpdateModule={handleUpdateModuleDrip}
                onUpdateLesson={handleUpdateLesson}
                isUpdatingCourse={updateCourseMutation.isPending}
                isUpdatingModule={updateModuleMutation.isPending}
                isUpdatingLesson={updateLessonMutation.isPending}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <ResizablePanelGroup direction="horizontal">
            {/* Left Panel: Outline */}
            <ResizablePanel defaultSize={22} minSize={18} maxSize={35}>
              <CourseOutlinePanel
                course={course as CourseData}
                selection={selection}
                onSelectModule={handleSelectModule}
                onSelectLesson={handleSelectLesson}
                onRenameModule={handleRenameModule}
                onRenameLesson={handleRenameLesson}
                onDeleteModule={handleDeleteModule}
                onDeleteLesson={handleDeleteLesson}
                onAddModule={handleAddModule}
                onAddLesson={handleAddLesson}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Center Panel: Content Editor */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <ScrollArea className="h-full">
                <ContentEditorPanel
                  selection={selection}
                  course={course as CourseData}
                  courseContext={courseContext}
                  onSaveContent={handleSaveContent}
                  isSavingContent={updateContentMutation.isPending}
                  isPreviewMode={isPreviewMode}
                />
              </ScrollArea>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel: Settings */}
            <ResizablePanel defaultSize={28} minSize={20} maxSize={38}>
              <SettingsPanel
                selection={selection}
                course={course as CourseData}
                onUpdateCourse={handleUpdateCourse}
                onUpdateModule={handleUpdateModuleDrip}
                onUpdateLesson={handleUpdateLesson}
                isUpdatingCourse={updateCourseMutation.isPending}
                isUpdatingModule={updateModuleMutation.isPending}
                isUpdatingLesson={updateLessonMutation.isPending}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
