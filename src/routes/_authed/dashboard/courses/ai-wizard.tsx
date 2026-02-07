import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useReducer, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  GripVertical,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
  X,
  BookOpen,
  Clock,
  Users,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { RouteErrorBoundary } from "@/components/error-boundary";
import type {
  CourseOutline,
  BloomLevel,
} from "@/lib/ai/types";

// ---------- Route ----------

export const Route = createFileRoute(
  "/_authed/dashboard/courses/ai-wizard",
)({
  component: AIWizardPage,
  errorComponent: RouteErrorBoundary,
});

// ---------- Types ----------

type WizardStep = 0 | 1 | 2 | 3;
type CourseLevel = "beginner" | "intermediate" | "advanced";
type LessonStatus = "pending" | "generating" | "complete" | "error";

interface TopicInput {
  readonly topic: string;
  readonly audience: string;
  readonly level: CourseLevel;
  readonly moduleCount: number;
}

interface MutableLesson {
  readonly id: string;
  title: string;
  readonly description: string;
  readonly bloomLevel: BloomLevel;
  readonly objectives: ReadonlyArray<string>;
  readonly lessonType: "video" | "text" | "quiz" | "assignment" | "live";
  readonly estimatedMinutes: number;
  readonly isFreePreview: boolean;
  status: LessonStatus;
  content: string | null;
}

interface MutableModule {
  readonly id: string;
  title: string;
  readonly description: string;
  lessons: MutableLesson[];
}

interface WizardState {
  readonly step: WizardStep;
  readonly topicInput: TopicInput;
  readonly outline: MutableModule[] | null;
  readonly courseTitle: string;
  readonly courseDescription: string;
  readonly estimatedHours: number;
  readonly prerequisites: string[];
  readonly learningOutcomes: string[];
  readonly isGeneratingOutline: boolean;
  readonly isGeneratingContent: boolean;
  readonly isCreatingCourse: boolean;
}

type WizardAction =
  | { readonly type: "SET_STEP"; readonly step: WizardStep }
  | { readonly type: "UPDATE_TOPIC_INPUT"; readonly input: Partial<TopicInput> }
  | { readonly type: "SET_GENERATING_OUTLINE"; readonly value: boolean }
  | {
      readonly type: "SET_OUTLINE";
      readonly outline: CourseOutline;
    }
  | { readonly type: "UPDATE_MODULE_TITLE"; readonly moduleId: string; readonly title: string }
  | { readonly type: "UPDATE_LESSON_TITLE"; readonly moduleId: string; readonly lessonId: string; readonly title: string }
  | { readonly type: "ADD_MODULE" }
  | { readonly type: "REMOVE_MODULE"; readonly moduleId: string }
  | { readonly type: "ADD_LESSON"; readonly moduleId: string }
  | { readonly type: "REMOVE_LESSON"; readonly moduleId: string; readonly lessonId: string }
  | { readonly type: "MOVE_MODULE_UP"; readonly moduleId: string }
  | { readonly type: "MOVE_MODULE_DOWN"; readonly moduleId: string }
  | { readonly type: "SET_LESSON_STATUS"; readonly lessonId: string; readonly status: LessonStatus }
  | { readonly type: "SET_LESSON_CONTENT"; readonly lessonId: string; readonly content: string }
  | { readonly type: "SET_GENERATING_CONTENT"; readonly value: boolean }
  | { readonly type: "SET_CREATING_COURSE"; readonly value: boolean };

// ---------- Helpers ----------

let nextIdCounter = 1;
const generateId = (): string => {
  const id = `temp_${Date.now()}_${nextIdCounter}`;
  nextIdCounter += 1;
  return id;
};

const outlineToMutableModules = (outline: CourseOutline): MutableModule[] =>
  outline.modules.map((mod, modIdx) => ({
    id: generateId(),
    title: mod.title,
    description: mod.description,
    lessons: mod.lessons.map((lesson) => ({
      id: generateId(),
      title: lesson.title,
      description: lesson.description,
      bloomLevel: lesson.bloomLevel,
      objectives: lesson.objectives,
      lessonType: lesson.lessonType,
      estimatedMinutes: lesson.estimatedMinutes,
      isFreePreview: modIdx === 0 && lesson === mod.lessons.at(0),
      status: "pending" as LessonStatus,
      content: null,
    })),
  }));

// ---------- Reducer ----------

const initialState: WizardState = {
  step: 0,
  topicInput: {
    topic: "",
    audience: "",
    level: "beginner",
    moduleCount: 5,
  },
  outline: null,
  courseTitle: "",
  courseDescription: "",
  estimatedHours: 0,
  prerequisites: [],
  learningOutcomes: [],
  isGeneratingOutline: false,
  isGeneratingContent: false,
  isCreatingCourse: false,
};

const wizardReducer = (state: WizardState, action: WizardAction): WizardState => {
  switch (action.type) {
    case "SET_STEP": {
      return { ...state, step: action.step };
    }
    case "UPDATE_TOPIC_INPUT": {
      return {
        ...state,
        topicInput: { ...state.topicInput, ...action.input },
      };
    }
    case "SET_GENERATING_OUTLINE": {
      return { ...state, isGeneratingOutline: action.value };
    }
    case "SET_OUTLINE": {
      const modules = outlineToMutableModules(action.outline);
      return {
        ...state,
        outline: modules,
        courseTitle: action.outline.title,
        courseDescription: action.outline.description,
        estimatedHours: action.outline.estimatedHours,
        prerequisites: [...action.outline.prerequisites],
        learningOutcomes: [...action.outline.learningOutcomes],
        isGeneratingOutline: false,
      };
    }
    case "UPDATE_MODULE_TITLE": {
      if (!state.outline) return state;
      return {
        ...state,
        outline: state.outline.map((mod) =>
          mod.id === action.moduleId
            ? { ...mod, title: action.title }
            : mod,
        ),
      };
    }
    case "UPDATE_LESSON_TITLE": {
      if (!state.outline) return state;
      return {
        ...state,
        outline: state.outline.map((mod) =>
          mod.id === action.moduleId
            ? {
                ...mod,
                lessons: mod.lessons.map((l) =>
                  l.id === action.lessonId
                    ? { ...l, title: action.title }
                    : l,
                ),
              }
            : mod,
        ),
      };
    }
    case "ADD_MODULE": {
      if (!state.outline) return state;
      const newModule: MutableModule = {
        id: generateId(),
        title: "New Module",
        description: "Describe this module",
        lessons: [],
      };
      return {
        ...state,
        outline: [...state.outline, newModule],
      };
    }
    case "REMOVE_MODULE": {
      if (!state.outline) return state;
      return {
        ...state,
        outline: state.outline.filter((mod) => mod.id !== action.moduleId),
      };
    }
    case "ADD_LESSON": {
      if (!state.outline) return state;
      const newLesson: MutableLesson = {
        id: generateId(),
        title: "New Lesson",
        description: "Describe this lesson",
        bloomLevel: "understand",
        objectives: ["Define the key concepts"],
        lessonType: "text",
        estimatedMinutes: 15,
        isFreePreview: false,
        status: "pending",
        content: null,
      };
      return {
        ...state,
        outline: state.outline.map((mod) =>
          mod.id === action.moduleId
            ? { ...mod, lessons: [...mod.lessons, newLesson] }
            : mod,
        ),
      };
    }
    case "REMOVE_LESSON": {
      if (!state.outline) return state;
      return {
        ...state,
        outline: state.outline.map((mod) =>
          mod.id === action.moduleId
            ? {
                ...mod,
                lessons: mod.lessons.filter((l) => l.id !== action.lessonId),
              }
            : mod,
        ),
      };
    }
    case "MOVE_MODULE_UP": {
      if (!state.outline) return state;
      const idx = state.outline.findIndex((m) => m.id === action.moduleId);
      if (idx <= 0) return state;
      const arr = [...state.outline];
      const swapped = arr[idx - 1];
      arr[idx - 1] = arr[idx];
      arr[idx] = swapped;
      return { ...state, outline: arr };
    }
    case "MOVE_MODULE_DOWN": {
      if (!state.outline) return state;
      const idx = state.outline.findIndex((m) => m.id === action.moduleId);
      if (idx < 0 || idx >= state.outline.length - 1) return state;
      const arr = [...state.outline];
      const swapped = arr[idx + 1];
      arr[idx + 1] = arr[idx];
      arr[idx] = swapped;
      return { ...state, outline: arr };
    }
    case "SET_LESSON_STATUS": {
      if (!state.outline) return state;
      return {
        ...state,
        outline: state.outline.map((mod) => ({
          ...mod,
          lessons: mod.lessons.map((l) =>
            l.id === action.lessonId
              ? { ...l, status: action.status }
              : l,
          ),
        })),
      };
    }
    case "SET_LESSON_CONTENT": {
      if (!state.outline) return state;
      return {
        ...state,
        outline: state.outline.map((mod) => ({
          ...mod,
          lessons: mod.lessons.map((l) =>
            l.id === action.lessonId
              ? { ...l, content: action.content, status: "complete" as LessonStatus }
              : l,
          ),
        })),
      };
    }
    case "SET_GENERATING_CONTENT": {
      return { ...state, isGeneratingContent: action.value };
    }
    case "SET_CREATING_COURSE": {
      return { ...state, isCreatingCourse: action.value };
    }
    default: {
      return state;
    }
  }
};

// ---------- Mock Data Generator ----------

const MOCK_OUTLINE: CourseOutline = {
  title: "Mastering Modern React Development",
  slug: "mastering-modern-react-development",
  description:
    "A comprehensive course covering the latest React patterns, hooks, and best practices for building production-ready applications. You will learn to build scalable, maintainable frontends using modern tooling.",
  audience: "Intermediate JavaScript developers looking to level up their React skills",
  level: "intermediate",
  prerequisites: ["Basic JavaScript/TypeScript", "HTML & CSS fundamentals", "Basic React knowledge"],
  learningOutcomes: [
    "Build complex UIs with advanced React patterns",
    "Implement performant state management solutions",
    "Write comprehensive tests for React applications",
    "Deploy and monitor production React applications",
  ],
  estimatedHours: 12,
  modules: [
    {
      title: "Advanced Hooks & Patterns",
      description: "Deep dive into custom hooks, compound components, and render props",
      lessons: [
        {
          title: "Custom Hooks Best Practices",
          description: "Learn to extract and compose reusable logic with custom hooks",
          bloomLevel: "apply",
          objectives: [
            "Create custom hooks that encapsulate complex logic",
            "Compose multiple hooks together effectively",
            "Handle cleanup and dependency management",
          ],
          lessonType: "text",
          estimatedMinutes: 25,
          isFreePreview: true,
        },
        {
          title: "Compound Component Pattern",
          description: "Build flexible component APIs using the compound component pattern",
          bloomLevel: "analyze",
          objectives: [
            "Implement the compound component pattern",
            "Use React.Children and context for implicit state sharing",
          ],
          lessonType: "video",
          estimatedMinutes: 30,
          isFreePreview: false,
        },
        {
          title: "Module 1 Quiz",
          description: "Test your understanding of advanced hooks and patterns",
          bloomLevel: "evaluate",
          objectives: ["Demonstrate understanding of custom hooks and patterns"],
          lessonType: "quiz",
          estimatedMinutes: 10,
          isFreePreview: false,
        },
      ],
    },
    {
      title: "State Management at Scale",
      description: "Exploring state management solutions for large applications",
      lessons: [
        {
          title: "React Context Optimization",
          description: "Prevent unnecessary re-renders when using React Context",
          bloomLevel: "apply",
          objectives: [
            "Identify context performance pitfalls",
            "Split contexts for optimal updates",
          ],
          lessonType: "text",
          estimatedMinutes: 20,
          isFreePreview: false,
        },
        {
          title: "External State with Zustand",
          description: "Lightweight state management with Zustand",
          bloomLevel: "apply",
          objectives: [
            "Set up Zustand stores",
            "Implement selectors for performance",
          ],
          lessonType: "video",
          estimatedMinutes: 35,
          isFreePreview: false,
        },
        {
          title: "Server State with TanStack Query",
          description: "Managing async data fetching and caching",
          bloomLevel: "apply",
          objectives: [
            "Configure query clients and defaults",
            "Implement mutations with optimistic updates",
          ],
          lessonType: "text",
          estimatedMinutes: 30,
          isFreePreview: false,
        },
      ],
    },
    {
      title: "Testing React Applications",
      description: "Comprehensive testing strategies for React components and hooks",
      lessons: [
        {
          title: "Component Testing with Vitest",
          description: "Write fast, reliable component tests",
          bloomLevel: "apply",
          objectives: [
            "Set up Vitest with React Testing Library",
            "Write tests that resemble how users interact with your app",
          ],
          lessonType: "text",
          estimatedMinutes: 25,
          isFreePreview: false,
        },
        {
          title: "Testing Custom Hooks",
          description: "Test hooks in isolation with renderHook",
          bloomLevel: "apply",
          objectives: [
            "Use renderHook for hook testing",
            "Mock dependencies and timers",
          ],
          lessonType: "video",
          estimatedMinutes: 20,
          isFreePreview: false,
        },
      ],
    },
    {
      title: "Performance & Deployment",
      description: "Optimize and deploy your React application",
      lessons: [
        {
          title: "React Performance Profiling",
          description: "Identify and fix performance bottlenecks",
          bloomLevel: "analyze",
          objectives: [
            "Use React DevTools Profiler",
            "Implement React.memo and useMemo correctly",
          ],
          lessonType: "text",
          estimatedMinutes: 25,
          isFreePreview: false,
        },
        {
          title: "Production Deployment Strategies",
          description: "Deploy with CI/CD, monitoring, and error tracking",
          bloomLevel: "apply",
          objectives: [
            "Configure CI/CD pipelines for React apps",
            "Set up error monitoring with Sentry",
          ],
          lessonType: "video",
          estimatedMinutes: 30,
          isFreePreview: false,
        },
        {
          title: "Final Assessment",
          description: "Comprehensive quiz covering all course material",
          bloomLevel: "evaluate",
          objectives: ["Demonstrate mastery of modern React development"],
          lessonType: "quiz",
          estimatedMinutes: 15,
          isFreePreview: false,
        },
      ],
    },
  ],
};

const MOCK_LESSON_CONTENT = `<h2>Introduction</h2>
<p>In this lesson, we will explore the fundamental concepts and best practices that form the foundation of this topic. By the end, you will have a solid understanding of the key principles.</p>
<h3>Key Concepts</h3>
<ul>
<li>Understanding the core architecture and design patterns</li>
<li>Implementing solutions with practical examples</li>
<li>Handling edge cases and error scenarios</li>
</ul>
<h3>Practical Example</h3>
<p>Let us walk through a real-world example that demonstrates these concepts in action. Pay attention to how each piece fits together to create a cohesive solution.</p>
<h3>Summary</h3>
<p>We covered the essential building blocks and how they work together. In the next lesson, we will build on this foundation with more advanced techniques.</p>`;

// ---------- Step indicators ----------

const STEP_LABELS: ReadonlyArray<string> = [
  "Topic & Audience",
  "Review Outline",
  "Generate Content",
  "Review & Create",
];

interface StepperProps {
  readonly currentStep: WizardStep;
  readonly onStepClick: (step: WizardStep) => void;
  readonly canNavigateTo: (step: WizardStep) => boolean;
}

function Stepper({ currentStep, onStepClick, canNavigateTo }: StepperProps) {
  return (
    <nav aria-label="Wizard steps" className="mb-8">
      <ol className="flex items-center gap-2">
        {STEP_LABELS.map((label, index) => {
          const step = index as WizardStep;
          const isCompleted = currentStep > step;
          const isCurrent = currentStep === step;
          const canNavigate = canNavigateTo(step);

          const handleClick = () => {
            if (canNavigate) {
              onStepClick(step);
            }
          };

          const handleKeyDown = (e: React.KeyboardEvent) => {
            if ((e.key === "Enter" || e.key === " ") && canNavigate) {
              e.preventDefault();
              onStepClick(step);
            }
          };

          return (
            <li key={label} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={handleClick}
                  onKeyDown={handleKeyDown}
                  disabled={!canNavigate}
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2",
                    !isCompleted && !isCurrent && "border bg-muted text-muted-foreground",
                    canNavigate && !isCurrent && "cursor-pointer hover:bg-primary/80 hover:text-primary-foreground",
                    !canNavigate && "cursor-not-allowed opacity-60",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Step ${index + 1}: ${label}`}
                >
                  {isCompleted ? <Check className="size-4" /> : index + 1}
                </button>
                <span
                  className={cn(
                    "hidden text-sm font-medium sm:inline",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
              {index < STEP_LABELS.length - 1 && (
                <Separator
                  className={cn(
                    "hidden flex-1 sm:block",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---------- Step 1: Topic Input ----------

interface TopicStepProps {
  readonly input: TopicInput;
  readonly onUpdate: (update: Partial<TopicInput>) => void;
  readonly onGenerate: () => void;
  readonly isGenerating: boolean;
}

function TopicStep({ input, onUpdate, onGenerate, isGenerating }: TopicStepProps) {
  const isValid =
    input.topic.trim().length >= 3 && input.audience.trim().length >= 3;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isValid) {
        onGenerate();
      }
    },
    [isValid, onGenerate],
  );

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="size-5" />
          AI Course Generator
        </CardTitle>
        <CardDescription>
          Describe your course topic and target audience. Our AI will generate a
          comprehensive course outline with modules and lessons.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="wizard-topic">Course Topic</Label>
            <Textarea
              id="wizard-topic"
              placeholder="e.g., Modern React Development with TypeScript and Server Components"
              value={input.topic}
              onChange={(e) => onUpdate({ topic: e.target.value })}
              className="min-h-[80px]"
              maxLength={500}
              required
              aria-describedby="topic-hint"
            />
            <p id="topic-hint" className="text-xs text-muted-foreground">
              Be specific about what the course should cover. Minimum 3 characters.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="wizard-audience">Target Audience</Label>
            <Input
              id="wizard-audience"
              placeholder="e.g., Intermediate JavaScript developers transitioning to React"
              value={input.audience}
              onChange={(e) => onUpdate({ audience: e.target.value })}
              maxLength={300}
              required
              aria-describedby="audience-hint"
            />
            <p id="audience-hint" className="text-xs text-muted-foreground">
              Describe who this course is for. This helps tailor the difficulty and examples.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="wizard-level">Difficulty Level</Label>
            <Select
              value={input.level}
              onValueChange={(val) => onUpdate({ level: val as CourseLevel })}
            >
              <SelectTrigger id="wizard-level" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="wizard-modules">Number of Modules</Label>
              <Badge variant="secondary">{input.moduleCount}</Badge>
            </div>
            <Slider
              id="wizard-modules"
              min={3}
              max={8}
              step={1}
              value={[input.moduleCount]}
              onValueChange={(val) => onUpdate({ moduleCount: val.at(0) ?? 5 })}
              aria-label="Number of modules"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3 modules</span>
              <span>8 modules</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
            <Sparkles className="size-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-medium">AI-Powered Generation</p>
              <p className="text-muted-foreground">
                The AI will create a structured outline with learning objectives,
                Bloom&#39;s taxonomy levels, and estimated durations for each lesson.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating Outline...
              </>
            ) : (
              <>
                <Wand2 className="size-4" />
                Generate Course Outline
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------- Step 2: Outline Review ----------

interface OutlineModuleItemProps {
  readonly module: MutableModule;
  readonly moduleIndex: number;
  readonly totalModules: number;
  readonly onUpdateTitle: (title: string) => void;
  readonly onUpdateLessonTitle: (lessonId: string, title: string) => void;
  readonly onRemove: () => void;
  readonly onAddLesson: () => void;
  readonly onRemoveLesson: (lessonId: string) => void;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
}

function OutlineModuleItem({
  module: mod,
  moduleIndex,
  totalModules,
  onUpdateTitle,
  onUpdateLessonTitle,
  onRemove,
  onAddLesson,
  onRemoveLesson,
  onMoveUp,
  onMoveDown,
}: OutlineModuleItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(mod.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed.length > 0) {
      onUpdateTitle(trimmed);
    } else {
      setEditTitle(mod.title);
    }
    setIsEditingTitle(false);
  }, [editTitle, mod.title, onUpdateTitle]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSaveTitle();
      }
      if (e.key === "Escape") {
        setEditTitle(mod.title);
        setIsEditingTitle(false);
      }
    },
    [handleSaveTitle, mod.title],
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
          <GripVertical className="size-4 shrink-0 text-muted-foreground cursor-grab" />
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6 shrink-0"
              aria-label={isOpen ? "Collapse module" : "Expand module"}
            >
              {isOpen ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <Badge variant="outline" className="shrink-0">
            {`Module ${moduleIndex + 1}`}
          </Badge>
          {isEditingTitle ? (
            <Input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleTitleKeyDown}
              className="h-7 flex-1 text-sm font-medium"
              maxLength={200}
              aria-label="Module title"
            />
          ) : (
            <button
              type="button"
              className="flex-1 truncate text-left text-sm font-medium hover:underline"
              onClick={() => {
                setEditTitle(mod.title);
                setIsEditingTitle(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEditTitle(mod.title);
                  setIsEditingTitle(true);
                }
              }}
              aria-label={`Edit module title: ${mod.title}`}
            >
              {mod.title}
            </button>
          )}
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6"
              onClick={() => {
                setEditTitle(mod.title);
                setIsEditingTitle(true);
              }}
              aria-label="Edit module title"
            >
              <Edit3 className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6"
              onClick={onMoveUp}
              disabled={moduleIndex === 0}
              aria-label="Move module up"
            >
              <ChevronRight className="size-3.5 -rotate-90" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6"
              onClick={onMoveDown}
              disabled={moduleIndex === totalModules - 1}
              aria-label="Move module down"
            >
              <ChevronRight className="size-3.5 rotate-90" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6 text-destructive hover:text-destructive"
              onClick={onRemove}
              disabled={totalModules <= 1}
              aria-label={`Remove module: ${mod.title}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
        <CollapsibleContent>
          <div className="p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              {mod.description}
            </p>
            <div className="space-y-2">
              {mod.lessons.map((lesson) => (
                <OutlineLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  moduleId={mod.id}
                  onUpdateTitle={(title) => onUpdateLessonTitle(lesson.id, title)}
                  onRemove={() => onRemoveLesson(lesson.id)}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onAddLesson}
              aria-label={`Add lesson to ${mod.title}`}
            >
              <Plus className="size-3.5" />
              Add Lesson
            </Button>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface OutlineLessonItemProps {
  readonly lesson: MutableLesson;
  readonly moduleId: string;
  readonly onUpdateTitle: (title: string) => void;
  readonly onRemove: () => void;
}

function OutlineLessonItem({
  lesson,
  onUpdateTitle,
  onRemove,
}: OutlineLessonItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(lesson.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed.length > 0) {
      onUpdateTitle(trimmed);
    } else {
      setEditTitle(lesson.title);
    }
    setIsEditing(false);
  }, [editTitle, lesson.title, onUpdateTitle]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        setEditTitle(lesson.title);
        setIsEditing(false);
      }
    },
    [handleSave, lesson.title],
  );

  const typeVariant: Record<string, "default" | "secondary" | "outline"> = {
    video: "default",
    text: "secondary",
    quiz: "outline",
    assignment: "secondary",
    live: "default",
  };

  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
      <GripVertical className="size-3.5 shrink-0 text-muted-foreground cursor-grab" />
      <Badge variant={typeVariant[lesson.lessonType] ?? "secondary"} className="shrink-0 text-[10px]">
        {lesson.lessonType}
      </Badge>
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-6 flex-1 text-xs"
          maxLength={200}
          aria-label="Lesson title"
        />
      ) : (
        <button
          type="button"
          className="flex-1 truncate text-left text-sm hover:underline"
          onClick={() => {
            setEditTitle(lesson.title);
            setIsEditing(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setEditTitle(lesson.title);
              setIsEditing(true);
            }
          }}
          aria-label={`Edit lesson title: ${lesson.title}`}
        >
          {lesson.title}
        </button>
      )}
      <span className="shrink-0 text-xs text-muted-foreground">
        {`${lesson.estimatedMinutes}min`}
      </span>
      {lesson.isFreePreview && (
        <Badge variant="outline" className="shrink-0 text-[10px]">
          Free
        </Badge>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-6 shrink-0 text-destructive hover:text-destructive"
        onClick={onRemove}
        aria-label={`Remove lesson: ${lesson.title}`}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}

interface OutlineStepProps {
  readonly state: WizardState;
  readonly dispatch: React.Dispatch<WizardAction>;
}

function OutlineStep({ state, dispatch }: OutlineStepProps) {
  if (state.isGeneratingOutline) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3 py-6">
          <Loader2 className="size-5 animate-spin text-primary" />
          <p className="text-sm font-medium">Generating course outline...</p>
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!state.outline) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">
          No outline generated yet. Go back to Step 1 to generate one.
        </p>
      </div>
    );
  }

  const totalLessons = state.outline.reduce(
    (sum, mod) => sum + mod.lessons.length,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{state.courseTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {state.courseDescription}
          </p>
        </div>
        <div className="flex shrink-0 gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="size-4" />
            {`${state.outline.length} modules`}
          </span>
          <span className="flex items-center gap-1">
            <Target className="size-4" />
            {`${totalLessons} lessons`}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-4" />
            {`${state.estimatedHours}h`}
          </span>
        </div>
      </div>

      {state.prerequisites.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Prerequisites</p>
          <div className="flex flex-wrap gap-2">
            {state.prerequisites.map((prereq) => (
              <Badge key={prereq} variant="secondary">
                {prereq}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Course Structure</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: "ADD_MODULE" })}
          aria-label="Add new module"
        >
          <Plus className="size-3.5" />
          Add Module
        </Button>
      </div>

      <div className="space-y-4">
        {state.outline.map((mod, idx) => (
          <OutlineModuleItem
            key={mod.id}
            module={mod}
            moduleIndex={idx}
            totalModules={state.outline?.length ?? 0}
            onUpdateTitle={(title) =>
              dispatch({ type: "UPDATE_MODULE_TITLE", moduleId: mod.id, title })
            }
            onUpdateLessonTitle={(lessonId, title) =>
              dispatch({
                type: "UPDATE_LESSON_TITLE",
                moduleId: mod.id,
                lessonId,
                title,
              })
            }
            onRemove={() =>
              dispatch({ type: "REMOVE_MODULE", moduleId: mod.id })
            }
            onAddLesson={() =>
              dispatch({ type: "ADD_LESSON", moduleId: mod.id })
            }
            onRemoveLesson={(lessonId) =>
              dispatch({ type: "REMOVE_LESSON", moduleId: mod.id, lessonId })
            }
            onMoveUp={() =>
              dispatch({ type: "MOVE_MODULE_UP", moduleId: mod.id })
            }
            onMoveDown={() =>
              dispatch({ type: "MOVE_MODULE_DOWN", moduleId: mod.id })
            }
          />
        ))}
      </div>
    </div>
  );
}

// ---------- Step 3: Content Generation ----------

const LESSON_STATUS_CONFIG: Record<
  LessonStatus,
  { readonly label: string; readonly variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  pending: { label: "Pending", variant: "outline" },
  generating: { label: "Generating...", variant: "secondary" },
  complete: { label: "Complete", variant: "default" },
  error: { label: "Error", variant: "destructive" },
};

interface ContentGenerationStepProps {
  readonly state: WizardState;
  readonly dispatch: React.Dispatch<WizardAction>;
}

function ContentGenerationStep({ state, dispatch }: ContentGenerationStepProps) {
  const abortRef = useRef<AbortController | null>(null);

  const allLessons = (state.outline ?? []).flatMap((mod) => mod.lessons);
  const completedCount = allLessons.filter((l) => l.status === "complete").length;
  const totalCount = allLessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const simulateGeneration = useCallback(
    async (lesson: MutableLesson) => {
      dispatch({ type: "SET_LESSON_STATUS", lessonId: lesson.id, status: "generating" });
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 1_500 + Math.random() * 1_500);
        abortRef.current?.signal.addEventListener("abort", () => {
          clearTimeout(timer);
          resolve();
        }, { once: true });
      });
      if (abortRef.current?.signal.aborted) return;
      dispatch({
        type: "SET_LESSON_CONTENT",
        lessonId: lesson.id,
        content: MOCK_LESSON_CONTENT,
      });
    },
    [dispatch],
  );

  const handleGenerateSingle = useCallback(
    async (lesson: MutableLesson) => {
      abortRef.current = new AbortController();
      await simulateGeneration(lesson);
    },
    [simulateGeneration],
  );

  const handleGenerateAll = useCallback(async () => {
    dispatch({ type: "SET_GENERATING_CONTENT", value: true });
    abortRef.current = new AbortController();
    const pending = allLessons.filter(
      (l) => l.status === "pending" || l.status === "error",
    );
    for (const lesson of pending) {
      if (abortRef.current.signal.aborted) break;
      await simulateGeneration(lesson);
    }
    dispatch({ type: "SET_GENERATING_CONTENT", value: false });
  }, [allLessons, dispatch, simulateGeneration]);

  const handleStopGeneration = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ type: "SET_GENERATING_CONTENT", value: false });
  }, [dispatch]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  if (!state.outline) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No outline to generate content from.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Content Generation</h2>
          <p className="text-sm text-muted-foreground">
            {`${completedCount} of ${totalCount} lessons generated`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {state.isGeneratingContent ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleStopGeneration}
            >
              <X className="size-4" />
              Stop
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleGenerateAll}
              disabled={completedCount === totalCount}
            >
              <Sparkles className="size-4" />
              Generate All
            </Button>
          )}
        </div>
      </div>

      <Progress value={progressPercent} aria-label="Content generation progress" />

      <div className="space-y-4">
        {state.outline.map((mod, modIdx) => (
          <Card key={mod.id}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">
                {`Module ${modIdx + 1}: ${mod.title}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {mod.lessons.map((lesson) => {
                const statusConfig = LESSON_STATUS_CONFIG[lesson.status];
                const isGenerating = lesson.status === "generating";
                const canGenerate =
                  lesson.status === "pending" || lesson.status === "error";

                return (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 rounded-md border px-3 py-2"
                  >
                    {isGenerating && (
                      <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                    )}
                    {lesson.status === "complete" && (
                      <Check className="size-4 shrink-0 text-green-600" />
                    )}
                    {(lesson.status === "pending" || lesson.status === "error") && (
                      <div
                        className={cn(
                          "size-4 shrink-0 rounded-full border-2",
                          lesson.status === "error"
                            ? "border-destructive"
                            : "border-muted-foreground/30",
                        )}
                      />
                    )}
                    <span className="flex-1 truncate text-sm">
                      {lesson.title}
                    </span>
                    <Badge variant={statusConfig.variant} className="shrink-0">
                      {statusConfig.label}
                    </Badge>
                    {canGenerate && !state.isGeneratingContent && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGenerateSingle(lesson)}
                        aria-label={`Generate content for ${lesson.title}`}
                      >
                        <Sparkles className="size-3.5" />
                        Generate
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------- Step 4: Review & Create ----------

interface ReviewStepProps {
  readonly state: WizardState;
  readonly onCreateCourse: () => void;
}

function ReviewStep({ state, onCreateCourse }: ReviewStepProps) {
  if (!state.outline) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No course data to review.</p>
      </div>
    );
  }

  const allLessons = state.outline.flatMap((mod) => mod.lessons);
  const completedCount = allLessons.filter((l) => l.status === "complete").length;
  const totalLessons = allLessons.length;
  const totalMinutes = allLessons.reduce(
    (sum, l) => sum + l.estimatedMinutes,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{state.courseTitle}</CardTitle>
          <CardDescription>{state.courseDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border p-3 text-center">
              <BookOpen className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-1 text-lg font-bold">{state.outline.length}</p>
              <p className="text-xs text-muted-foreground">Modules</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <Target className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-1 text-lg font-bold">{totalLessons}</p>
              <p className="text-xs text-muted-foreground">Lessons</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <Clock className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-1 text-lg font-bold">{`${Math.round(totalMinutes / 60)}h`}</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <Users className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-1 text-lg font-bold capitalize">{state.topicInput.level}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {state.learningOutcomes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Learning Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {state.learningOutcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                  {outcome}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Course Content</h3>
        <Accordion type="multiple" defaultValue={state.outline.map((m) => m.id)}>
          {state.outline.map((mod, modIdx) => (
            <AccordionItem key={mod.id} value={mod.id}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="shrink-0">
                    {`Module ${modIdx + 1}`}
                  </Badge>
                  <span>{mod.title}</span>
                  <Badge variant="secondary" className="ml-2">
                    {`${mod.lessons.length} lessons`}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  {mod.lessons.map((lesson, lessonIdx) => {
                    const statusConfig = LESSON_STATUS_CONFIG[lesson.status];
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 rounded-md border bg-background px-3 py-2"
                      >
                        <span className="shrink-0 text-xs font-medium text-muted-foreground">
                          {`${modIdx + 1}.${lessonIdx + 1}`}
                        </span>
                        <Badge
                          variant={
                            lesson.lessonType === "quiz"
                              ? "outline"
                              : lesson.lessonType === "video"
                                ? "default"
                                : "secondary"
                          }
                          className="shrink-0 text-[10px]"
                        >
                          {lesson.lessonType}
                        </Badge>
                        <span className="flex-1 truncate text-sm">
                          {lesson.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {`${lesson.estimatedMinutes}min`}
                        </span>
                        <Badge variant={statusConfig.variant} className="shrink-0 text-[10px]">
                          {statusConfig.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Separator />

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <div>
          <p className="text-sm font-medium">Ready to create your course?</p>
          <p className="text-xs text-muted-foreground">
            {`${completedCount} of ${totalLessons} lessons have generated content`}
          </p>
        </div>
        <Button
          type="button"
          onClick={onCreateCourse}
          disabled={state.isCreatingCourse}
        >
          {state.isCreatingCourse ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Check className="size-4" />
              Create Course
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------- Main Wizard Page ----------

function AIWizardPage() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const canNavigateTo = useCallback(
    (step: WizardStep): boolean => {
      if (step === 0) return true;
      if (step === 1) return state.outline !== null || state.isGeneratingOutline;
      if (step === 2) return state.outline !== null;
      if (step === 3) return state.outline !== null;
      return false;
    },
    [state.outline, state.isGeneratingOutline],
  );

  const handleStepClick = useCallback(
    (step: WizardStep) => {
      if (canNavigateTo(step)) {
        dispatch({ type: "SET_STEP", step });
      }
    },
    [canNavigateTo],
  );

  const handleGenerate = useCallback(async () => {
    dispatch({ type: "SET_GENERATING_OUTLINE", value: true });
    dispatch({ type: "SET_STEP", step: 1 });

    // Simulate AI generation delay
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 2_500);
    });

    dispatch({ type: "SET_OUTLINE", outline: MOCK_OUTLINE });
  }, []);

  const handleCreateCourse = useCallback(async () => {
    dispatch({ type: "SET_CREATING_COURSE", value: true });

    // Simulate API call
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 2_000);
    });

    dispatch({ type: "SET_CREATING_COURSE", value: false });
    // In production, navigate to the created course
  }, []);

  const handleNext = useCallback(() => {
    if (state.step < 3) {
      dispatch({ type: "SET_STEP", step: (state.step + 1) as WizardStep });
    }
  }, [state.step]);

  const handleBack = useCallback(() => {
    if (state.step > 0) {
      dispatch({ type: "SET_STEP", step: (state.step - 1) as WizardStep });
    }
  }, [state.step]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to="/dashboard/courses" aria-label="Back to courses list">
            <ArrowLeft className="size-4" />
            Courses
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div>
          <h1 className="text-lg font-bold">AI Course Wizard</h1>
          <p className="text-xs text-muted-foreground">
            Create a course with AI-powered content generation
          </p>
        </div>
      </div>

      <Stepper
        currentStep={state.step}
        onStepClick={handleStepClick}
        canNavigateTo={canNavigateTo}
      />

      {/* Step summary bar */}
      {state.step > 0 && state.topicInput.topic.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-4 py-2 text-sm">
          <Badge variant="secondary">{state.topicInput.topic}</Badge>
          <Badge variant="outline">{state.topicInput.level}</Badge>
          <Badge variant="outline">{state.topicInput.audience}</Badge>
          <Badge variant="outline">
            {`${state.topicInput.moduleCount} modules`}
          </Badge>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[400px]">
        {state.step === 0 && (
          <TopicStep
            input={state.topicInput}
            onUpdate={(update) =>
              dispatch({ type: "UPDATE_TOPIC_INPUT", input: update })
            }
            onGenerate={handleGenerate}
            isGenerating={state.isGeneratingOutline}
          />
        )}

        {state.step === 1 && (
          <OutlineStep state={state} dispatch={dispatch} />
        )}

        {state.step === 2 && (
          <ContentGenerationStep state={state} dispatch={dispatch} />
        )}

        {state.step === 3 && (
          <ReviewStep state={state} onCreateCourse={handleCreateCourse} />
        )}
      </div>

      {/* Navigation */}
      {state.step > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={state.step === 0}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          {state.step < 3 && (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canNavigateTo((state.step + 1) as WizardStep)}
            >
              Next
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
