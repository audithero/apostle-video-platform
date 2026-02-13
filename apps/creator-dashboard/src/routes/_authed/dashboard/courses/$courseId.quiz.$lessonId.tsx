import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useReducer, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CircleDot,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileUp,
  GripVertical,
  HelpCircle,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Settings2,
  Sparkles,
  ToggleLeft,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TipTapEditor } from "@/components/course/TipTapEditor";
import { cn } from "@/lib/utils";
import { RouteErrorBoundary } from "@/components/error-boundary";
import type { GeneratedQuiz } from "@/lib/ai/types";
import { toast } from "sonner";

// ---------- Route ----------

export const Route = createFileRoute(
  "/_authed/dashboard/courses/$courseId/quiz/$lessonId",
)({
  component: QuizBuilderPage,
  errorComponent: RouteErrorBoundary,
});

// ---------- Types ----------

type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "file_upload";

interface QuizOption {
  readonly id: string;
  label: string;
  text: string;
}

interface FileUploadConfig {
  readonly allowedTypes: ReadonlyArray<string>;
  readonly maxFileSizeMb: number;
  readonly instructions: string;
}

interface QuizQuestion {
  readonly id: string;
  questionText: string;
  questionType: QuestionType;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
  points: number;
  order: number;
  fileUploadConfig?: FileUploadConfig;
}

interface QuizSettings {
  passingScore: number;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  shuffleQuestions: boolean;
  showFeedback: boolean;
}

interface QuizState {
  readonly questions: QuizQuestion[];
  readonly selectedQuestionId: string | null;
  readonly settings: QuizSettings;
  readonly isPreviewMode: boolean;
  readonly isSaving: boolean;
  readonly isGenerating: boolean;
  readonly previewAnswers: Record<string, string>;
  readonly previewSubmitted: boolean;
}

type QuizAction =
  | { readonly type: "ADD_QUESTION"; readonly questionType: QuestionType }
  | { readonly type: "REMOVE_QUESTION"; readonly questionId: string }
  | { readonly type: "DUPLICATE_QUESTION"; readonly questionId: string }
  | { readonly type: "SELECT_QUESTION"; readonly questionId: string | null }
  | { readonly type: "UPDATE_QUESTION"; readonly questionId: string; readonly updates: Partial<QuizQuestion> }
  | { readonly type: "UPDATE_OPTION"; readonly questionId: string; readonly optionId: string; readonly text: string }
  | { readonly type: "ADD_OPTION"; readonly questionId: string }
  | { readonly type: "REMOVE_OPTION"; readonly questionId: string; readonly optionId: string }
  | { readonly type: "SET_CORRECT_ANSWER"; readonly questionId: string; readonly answer: string }
  | { readonly type: "REORDER_QUESTION"; readonly questionId: string; readonly direction: "up" | "down" }
  | { readonly type: "DND_REORDER"; readonly activeId: string; readonly overId: string }
  | { readonly type: "IMPORT_QUESTIONS"; readonly questions: ReadonlyArray<QuizQuestion> }
  | { readonly type: "UPDATE_SETTINGS"; readonly settings: Partial<QuizSettings> }
  | { readonly type: "TOGGLE_PREVIEW" }
  | { readonly type: "SET_SAVING"; readonly value: boolean }
  | { readonly type: "SET_GENERATING"; readonly value: boolean }
  | { readonly type: "LOAD_GENERATED_QUIZ"; readonly quiz: GeneratedQuiz }
  | { readonly type: "SET_PREVIEW_ANSWER"; readonly questionId: string; readonly answer: string }
  | { readonly type: "SUBMIT_PREVIEW" }
  | { readonly type: "RESET_PREVIEW" };

// ---------- Helpers ----------

let idCounter = 1;
const generateId = (): string => {
  const id = `q_${Date.now()}_${idCounter}`;
  idCounter += 1;
  return id;
};

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True / False",
  short_answer: "Short Answer",
  file_upload: "File Upload",
};

const QUESTION_TYPE_ICONS: Record<QuestionType, typeof CircleDot> = {
  multiple_choice: CircleDot,
  true_false: ToggleLeft,
  short_answer: MessageSquare,
  file_upload: FileUp,
};

const createDefaultOptions = (questionType: QuestionType): QuizOption[] => {
  if (questionType === "multiple_choice") {
    return [
      { id: generateId(), label: "A", text: "" },
      { id: generateId(), label: "B", text: "" },
      { id: generateId(), label: "C", text: "" },
      { id: generateId(), label: "D", text: "" },
    ];
  }
  if (questionType === "true_false") {
    return [
      { id: generateId(), label: "True", text: "True" },
      { id: generateId(), label: "False", text: "False" },
    ];
  }
  return [];
};

const DEFAULT_FILE_UPLOAD_CONFIG: FileUploadConfig = {
  allowedTypes: [".pdf", ".doc", ".docx", ".txt", ".png", ".jpg"],
  maxFileSizeMb: 10,
  instructions: "Upload your completed assignment file.",
};

const createQuestion = (questionType: QuestionType, order: number): QuizQuestion => ({
  id: generateId(),
  questionText: "",
  questionType,
  options: createDefaultOptions(questionType),
  correctAnswer: questionType === "true_false" ? "True" : "",
  explanation: "",
  points: 1,
  order,
  ...(questionType === "file_upload" ? { fileUploadConfig: DEFAULT_FILE_UPLOAD_CONFIG } : {}),
});

// ---------- Mock data ----------

const MOCK_QUESTIONS: QuizQuestion[] = [
  {
    id: "mock_q1",
    questionText: "Which hook is used to manage side effects in React functional components?",
    questionType: "multiple_choice",
    options: [
      { id: "a1", label: "A", text: "useState" },
      { id: "a2", label: "B", text: "useEffect" },
      { id: "a3", label: "C", text: "useReducer" },
      { id: "a4", label: "D", text: "useContext" },
    ],
    correctAnswer: "B",
    explanation:
      "useEffect is the hook designed for managing side effects such as data fetching, subscriptions, or manually changing the DOM in React functional components.",
    points: 2,
    order: 0,
  },
  {
    id: "mock_q2",
    questionText: "React components re-render whenever their state or props change.",
    questionType: "true_false",
    options: [
      { id: "tf1", label: "True", text: "True" },
      { id: "tf2", label: "False", text: "False" },
    ],
    correctAnswer: "True",
    explanation:
      "By default, React components re-render when their state changes or when they receive new props from their parent component.",
    points: 1,
    order: 1,
  },
  {
    id: "mock_q3",
    questionText: "Explain the difference between controlled and uncontrolled components in React.",
    questionType: "short_answer",
    options: [],
    correctAnswer: "A controlled component has its state managed by React via props and callbacks, while an uncontrolled component stores its state internally in the DOM.",
    explanation:
      "Controlled components give React full control over form data through state and event handlers, making them more predictable and easier to test.",
    points: 3,
    order: 2,
  },
];

const MOCK_GENERATED_QUIZ: GeneratedQuiz = {
  title: "React Hooks Assessment",
  questions: [
    {
      questionText: "What is the primary purpose of the useCallback hook in React?",
      questionType: "multiple_choice",
      options: [
        { label: "A", text: "To create a new callback function on every render" },
        { label: "B", text: "To memoize a callback function between renders" },
        { label: "C", text: "To handle side effects in components" },
        { label: "D", text: "To manage component state" },
      ],
      correctAnswer: "B",
      explanation:
        "useCallback returns a memoized version of the callback that only changes if one of the dependencies has changed, preventing unnecessary re-renders of child components.",
      bloomLevel: "understand",
      points: 2,
    },
    {
      questionText: "The useMemo hook can be used to memoize expensive computations.",
      questionType: "true_false",
      options: [
        { label: "True", text: "True" },
        { label: "False", text: "False" },
      ],
      correctAnswer: "True",
      explanation:
        "useMemo returns a memoized value and only recomputes it when one of the dependencies has changed, which is useful for expensive calculations.",
      bloomLevel: "remember",
      points: 1,
    },
    {
      questionText: "Describe a scenario where using useRef would be more appropriate than useState.",
      questionType: "short_answer",
      options: [],
      correctAnswer:
        "useRef is more appropriate when you need to persist a value across renders without triggering a re-render, such as storing a timer ID, tracking previous values, or holding a reference to a DOM element.",
      explanation:
        "Unlike useState, updating a useRef value does not cause the component to re-render, making it ideal for values that need to persist but do not affect the visual output.",
      bloomLevel: "apply",
      points: 3,
    },
  ],
  passingScorePercent: 70,
  timeLimitMinutes: 15,
};

// ---------- Reducer ----------

const initialState: QuizState = {
  questions: MOCK_QUESTIONS,
  selectedQuestionId: MOCK_QUESTIONS.at(0)?.id ?? null,
  settings: {
    passingScore: 70,
    timeLimitMinutes: 15,
    maxAttempts: 3,
    shuffleQuestions: false,
    showFeedback: true,
  },
  isPreviewMode: false,
  isSaving: false,
  isGenerating: false,
  previewAnswers: {},
  previewSubmitted: false,
};

const quizReducer = (state: QuizState, action: QuizAction): QuizState => {
  switch (action.type) {
    case "ADD_QUESTION": {
      const newQuestion = createQuestion(
        action.questionType,
        state.questions.length,
      );
      return {
        ...state,
        questions: [...state.questions, newQuestion],
        selectedQuestionId: newQuestion.id,
      };
    }
    case "REMOVE_QUESTION": {
      const filtered = state.questions
        .filter((q) => q.id !== action.questionId)
        .map((q, idx) => ({ ...q, order: idx }));
      const newSelected =
        state.selectedQuestionId === action.questionId
          ? filtered.at(0)?.id ?? null
          : state.selectedQuestionId;
      return {
        ...state,
        questions: filtered,
        selectedQuestionId: newSelected,
      };
    }
    case "DUPLICATE_QUESTION": {
      const source = state.questions.find((q) => q.id === action.questionId);
      if (!source) return state;
      const duplicate: QuizQuestion = {
        ...source,
        id: generateId(),
        order: state.questions.length,
        options: source.options.map((opt) => ({
          ...opt,
          id: generateId(),
        })),
      };
      return {
        ...state,
        questions: [...state.questions, duplicate],
        selectedQuestionId: duplicate.id,
      };
    }
    case "SELECT_QUESTION": {
      return { ...state, selectedQuestionId: action.questionId };
    }
    case "UPDATE_QUESTION": {
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.questionId ? { ...q, ...action.updates } : q,
        ),
      };
    }
    case "UPDATE_OPTION": {
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.questionId
            ? {
                ...q,
                options: q.options.map((opt) =>
                  opt.id === action.optionId
                    ? { ...opt, text: action.text }
                    : opt,
                ),
              }
            : q,
        ),
      };
    }
    case "ADD_OPTION": {
      return {
        ...state,
        questions: state.questions.map((q) => {
          if (q.id !== action.questionId) return q;
          const labels = "ABCDEFGHIJ";
          const nextLabel = labels.charAt(q.options.length) || `Option ${q.options.length + 1}`;
          return {
            ...q,
            options: [
              ...q.options,
              { id: generateId(), label: nextLabel, text: "" },
            ],
          };
        }),
      };
    }
    case "REMOVE_OPTION": {
      return {
        ...state,
        questions: state.questions.map((q) => {
          if (q.id !== action.questionId) return q;
          const filtered = q.options.filter((opt) => opt.id !== action.optionId);
          const labels = "ABCDEFGHIJ";
          const relabeled = filtered.map((opt, idx) => ({
            ...opt,
            label: labels.charAt(idx) || `Option ${idx + 1}`,
          }));
          return { ...q, options: relabeled };
        }),
      };
    }
    case "SET_CORRECT_ANSWER": {
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.questionId
            ? { ...q, correctAnswer: action.answer }
            : q,
        ),
      };
    }
    case "REORDER_QUESTION": {
      const idx = state.questions.findIndex((q) => q.id === action.questionId);
      if (idx < 0) return state;
      const targetIdx = action.direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= state.questions.length) return state;
      const arr = [...state.questions];
      const swapped = arr[targetIdx];
      arr[targetIdx] = arr[idx];
      arr[idx] = swapped;
      const reordered = arr.map((q, i) => ({ ...q, order: i }));
      return { ...state, questions: reordered };
    }
    case "DND_REORDER": {
      const oldIndex = state.questions.findIndex((q) => q.id === action.activeId);
      const newIndex = state.questions.findIndex((q) => q.id === action.overId);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return state;
      const moved = arrayMove([...state.questions], oldIndex, newIndex);
      const reorderedDnd = moved.map((q, i) => ({ ...q, order: i }));
      return { ...state, questions: reorderedDnd };
    }
    case "IMPORT_QUESTIONS": {
      const baseOrder = state.questions.length;
      const imported = action.questions.map((q, idx) => ({
        ...q,
        id: generateId(),
        order: baseOrder + idx,
        options: q.options.map((opt) => ({ ...opt, id: generateId() })),
      }));
      return {
        ...state,
        questions: [...state.questions, ...imported],
        selectedQuestionId: imported.at(0)?.id ?? state.selectedQuestionId,
      };
    }
    case "UPDATE_SETTINGS": {
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };
    }
    case "TOGGLE_PREVIEW": {
      return {
        ...state,
        isPreviewMode: !state.isPreviewMode,
        previewAnswers: {},
        previewSubmitted: false,
      };
    }
    case "SET_SAVING": {
      return { ...state, isSaving: action.value };
    }
    case "SET_GENERATING": {
      return { ...state, isGenerating: action.value };
    }
    case "LOAD_GENERATED_QUIZ": {
      const baseOrder = state.questions.length;
      const newQuestions: QuizQuestion[] = action.quiz.questions.map(
        (q, idx) => ({
          id: generateId(),
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options.map((opt) => ({
            id: generateId(),
            label: opt.label,
            text: opt.text,
          })),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points,
          order: baseOrder + idx,
        }),
      );
      const allQuestions = [...state.questions, ...newQuestions];
      return {
        ...state,
        questions: allQuestions,
        selectedQuestionId: newQuestions.at(0)?.id ?? state.selectedQuestionId,
        isGenerating: false,
        settings: {
          ...state.settings,
          passingScore: action.quiz.passingScorePercent,
          timeLimitMinutes: action.quiz.timeLimitMinutes,
        },
      };
    }
    case "SET_PREVIEW_ANSWER": {
      return {
        ...state,
        previewAnswers: {
          ...state.previewAnswers,
          [action.questionId]: action.answer,
        },
      };
    }
    case "SUBMIT_PREVIEW": {
      return { ...state, previewSubmitted: true };
    }
    case "RESET_PREVIEW": {
      return {
        ...state,
        previewAnswers: {},
        previewSubmitted: false,
      };
    }
    default: {
      return state;
    }
  }
};

// ---------- Question List (Left Panel) ----------

interface QuestionListItemProps {
  readonly question: QuizQuestion;
  readonly index: number;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
  readonly onRemove: () => void;
  readonly onDuplicate: () => void;
}

function QuestionListItem({
  question,
  index,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
}: QuestionListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = QUESTION_TYPE_ICONS[question.questionType];
  const typeLabel = QUESTION_TYPE_LABELS[question.questionType];

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
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-2 rounded-md border px-3 py-2 transition-colors cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:border-primary/30 hover:bg-accent/50",
        isDragging && "z-50 shadow-lg",
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Question ${index + 1}: ${question.questionText || "Untitled question"}`}
      aria-pressed={isSelected}
    >
      <button
        type="button"
        className="mt-1 cursor-grab touch-none text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
        aria-label="Drag to reorder question"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="shrink-0 text-[10px] gap-1">
            <Icon className="size-3" />
            {typeLabel}
          </Badge>
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {`${question.points} pt${question.points !== 1 ? "s" : ""}`}
          </Badge>
        </div>
        <p className="line-clamp-2 text-sm">
          {question.questionText || "Untitled question"}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Actions for question ${index + 1}`}
          >
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={onDuplicate}>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={onRemove}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface QuestionListPanelProps {
  readonly questions: ReadonlyArray<QuizQuestion>;
  readonly selectedQuestionId: string | null;
  readonly dispatch: React.Dispatch<QuizAction>;
}

function QuestionListPanel({
  questions,
  selectedQuestionId,
  dispatch,
}: QuestionListPanelProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const questionIds = questions.map((q) => q.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        dispatch({
          type: "DND_REORDER",
          activeId: String(active.id),
          overId: String(over.id),
        });
      }
    },
    [dispatch],
  );

  const handleAddQuestion = useCallback(
    (questionType: QuestionType) => {
      dispatch({ type: "ADD_QUESTION", questionType });
      setAddDialogOpen(false);
    },
    [dispatch],
  );

  const QUESTION_TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
    multiple_choice: "Question with multiple options",
    true_false: "True or false statement",
    short_answer: "Open-ended text response",
    file_upload: "Student uploads a file",
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div>
          <h2 className="text-sm font-semibold">Questions</h2>
          <p className="text-xs text-muted-foreground">
            {`${questions.length} questions, ${totalPoints} points`}
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" size="sm" aria-label="Add question">
              <Plus className="size-3.5" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Question</DialogTitle>
              <DialogDescription>
                Choose the type of question to add.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              {(
                [
                  "multiple_choice",
                  "true_false",
                  "short_answer",
                  "file_upload",
                ] as const
              ).map((qType) => {
                const Icon = QUESTION_TYPE_ICONS[qType];
                return (
                  <button
                    key={qType}
                    type="button"
                    className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                    onClick={() => handleAddQuestion(qType)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleAddQuestion(qType);
                      }
                    }}
                    aria-label={`Add ${QUESTION_TYPE_LABELS[qType]} question`}
                  >
                    <div className="rounded-md bg-muted p-2">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {QUESTION_TYPE_LABELS[qType]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {QUESTION_TYPE_DESCRIPTIONS[qType]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questionIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 p-3">
              {questions.map((q, idx) => (
                <QuestionListItem
                  key={q.id}
                  question={q}
                  index={idx}
                  isSelected={selectedQuestionId === q.id}
                  onSelect={() =>
                    dispatch({ type: "SELECT_QUESTION", questionId: q.id })
                  }
                  onRemove={() =>
                    dispatch({ type: "REMOVE_QUESTION", questionId: q.id })
                  }
                  onDuplicate={() =>
                    dispatch({ type: "DUPLICATE_QUESTION", questionId: q.id })
                  }
                />
              ))}
              {questions.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <HelpCircle className="size-8 text-muted-foreground/50" />
                  <div>
                    <p className="text-sm font-medium">No questions yet</p>
                    <p className="text-xs text-muted-foreground">
                      Add your first question or generate with AI.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
}

// ---------- Question Editor (Right Panel) ----------

interface MultipleChoiceEditorProps {
  readonly question: QuizQuestion;
  readonly dispatch: React.Dispatch<QuizAction>;
}

function MultipleChoiceEditor({ question, dispatch }: MultipleChoiceEditorProps) {
  return (
    <div className="space-y-3">
      <Label>Answer Options</Label>
      <RadioGroup
        value={question.correctAnswer}
        onValueChange={(val) =>
          dispatch({
            type: "SET_CORRECT_ANSWER",
            questionId: question.id,
            answer: val,
          })
        }
        className="space-y-2"
      >
        {question.options.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <RadioGroupItem
              value={option.label}
              id={`opt-${option.id}`}
              aria-label={`Mark option ${option.label} as correct`}
            />
            <Badge
              variant={
                question.correctAnswer === option.label
                  ? "default"
                  : "outline"
              }
              className="shrink-0 text-[10px]"
            >
              {option.label}
            </Badge>
            <Input
              value={option.text}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_OPTION",
                  questionId: question.id,
                  optionId: option.id,
                  text: e.target.value,
                })
              }
              placeholder={`Option ${option.label}`}
              className="flex-1"
              aria-label={`Option ${option.label} text`}
            />
            {question.options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 shrink-0 text-destructive hover:text-destructive"
                onClick={() =>
                  dispatch({
                    type: "REMOVE_OPTION",
                    questionId: question.id,
                    optionId: option.id,
                  })
                }
                aria-label={`Remove option ${option.label}`}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </RadioGroup>
      {question.options.length < 8 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            dispatch({ type: "ADD_OPTION", questionId: question.id })
          }
          aria-label="Add another option"
        >
          <Plus className="size-3.5" />
          Add Option
        </Button>
      )}
      {question.correctAnswer.length > 0 && (
        <p className="text-xs text-green-600">
          {`Correct answer: ${question.correctAnswer}`}
        </p>
      )}
    </div>
  );
}

interface TrueFalseEditorProps {
  readonly question: QuizQuestion;
  readonly dispatch: React.Dispatch<QuizAction>;
}

function TrueFalseEditor({ question, dispatch }: TrueFalseEditorProps) {
  return (
    <div className="space-y-3">
      <Label>Correct Answer</Label>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor={`tf-toggle-${question.id}`} className="text-sm">
            {question.correctAnswer === "True" ? "True" : "False"}
          </Label>
          <Switch
            id={`tf-toggle-${question.id}`}
            checked={question.correctAnswer === "True"}
            onCheckedChange={(checked) =>
              dispatch({
                type: "SET_CORRECT_ANSWER",
                questionId: question.id,
                answer: checked ? "True" : "False",
              })
            }
            aria-label="Toggle correct answer between true and false"
          />
        </div>
        <Badge
          variant={question.correctAnswer === "True" ? "default" : "secondary"}
          className="text-xs"
        >
          {`Answer: ${question.correctAnswer}`}
        </Badge>
      </div>
    </div>
  );
}

interface ShortAnswerEditorProps {
  readonly question: QuizQuestion;
  readonly dispatch: React.Dispatch<QuizAction>;
}

function ShortAnswerEditor({ question, dispatch }: ShortAnswerEditorProps) {
  const [answers, setAnswers] = useState<string[]>(() => {
    const existing = question.correctAnswer;
    return existing.length > 0 ? existing.split("||") : [""];
  });

  const updateCorrectAnswer = useCallback(
    (newAnswers: string[]) => {
      setAnswers(newAnswers);
      dispatch({
        type: "SET_CORRECT_ANSWER",
        questionId: question.id,
        answer: newAnswers.filter((a) => a.trim().length > 0).join("||"),
      });
    },
    [dispatch, question.id],
  );

  return (
    <div className="space-y-3">
      <Label>Acceptable Answers</Label>
      <p className="text-xs text-muted-foreground">
        Add all answers that should be accepted as correct. Matching is case-insensitive.
      </p>
      <div className="space-y-2">
        {answers.map((answer, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              value={answer}
              onChange={(e) => {
                const updated = [...answers];
                updated[idx] = e.target.value;
                updateCorrectAnswer(updated);
              }}
              placeholder={`Acceptable answer ${idx + 1}`}
              aria-label={`Acceptable answer ${idx + 1}`}
            />
            {answers.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 shrink-0 text-destructive hover:text-destructive"
                onClick={() => {
                  const updated = answers.filter((_, i) => i !== idx);
                  updateCorrectAnswer(updated);
                }}
                aria-label={`Remove answer ${idx + 1}`}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => updateCorrectAnswer([...answers, ""])}
        aria-label="Add another acceptable answer"
      >
        <Plus className="size-3.5" />
        Add Answer
      </Button>
    </div>
  );
}

interface FileUploadEditorProps {
  readonly question: QuizQuestion;
  readonly dispatch: React.Dispatch<QuizAction>;
}

function FileUploadEditor({ question, dispatch }: FileUploadEditorProps) {
  const config = question.fileUploadConfig ?? DEFAULT_FILE_UPLOAD_CONFIG;

  const handleUpdateConfig = useCallback(
    (updates: Partial<FileUploadConfig>) => {
      dispatch({
        type: "UPDATE_QUESTION",
        questionId: question.id,
        updates: {
          fileUploadConfig: { ...config, ...updates },
        },
      });
    },
    [dispatch, question.id, config],
  );

  return (
    <div className="space-y-4">
      <Label>File Upload Configuration</Label>

      <div
        className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/25 p-6"
        role="region"
        aria-label="File upload preview zone"
      >
        <Upload className="size-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">File Upload Zone Preview</p>
          <p className="text-xs text-muted-foreground">
            Students will see a drag-and-drop area like this to upload their files.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {config.allowedTypes.join(", ")}
        </Badge>
        <p className="text-xs text-muted-foreground">
          {`Max file size: ${config.maxFileSizeMb} MB`}
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`upload-types-${question.id}`}>Allowed File Types</Label>
        <Input
          id={`upload-types-${question.id}`}
          value={config.allowedTypes.join(", ")}
          onChange={(e) =>
            handleUpdateConfig({
              allowedTypes: e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0),
            })
          }
          placeholder=".pdf, .doc, .docx, .txt"
          aria-label="Comma-separated list of allowed file types"
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated list of file extensions
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`max-size-${question.id}`}>Max File Size (MB)</Label>
        <Input
          id={`max-size-${question.id}`}
          type="number"
          min={1}
          max={100}
          value={config.maxFileSizeMb}
          onChange={(e) =>
            handleUpdateConfig({
              maxFileSizeMb: Number.parseInt(e.target.value, 10) || 10,
            })
          }
          className="w-24"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`upload-instructions-${question.id}`}>
          Upload Instructions
        </Label>
        <Textarea
          id={`upload-instructions-${question.id}`}
          value={config.instructions}
          onChange={(e) =>
            handleUpdateConfig({ instructions: e.target.value })
          }
          placeholder="Instructions for what students should upload..."
          className="min-h-[60px]"
        />
      </div>
    </div>
  );
}

// ---------- Import / Export ----------

interface ImportExportDialogProps {
  readonly questions: ReadonlyArray<QuizQuestion>;
  readonly dispatch: React.Dispatch<QuizAction>;
}

function ImportExportDialog({ questions, dispatch }: ImportExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const exportData = questions.map((q) => ({
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options.map((o) => ({ label: o.label, text: o.text })),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points,
      ...(q.fileUploadConfig ? { fileUploadConfig: q.fileUploadConfig } : {}),
    }));
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz-questions.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${questions.length} questions`);
  }, [questions]);

  const handleImport = useCallback(() => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importText) as unknown;
      if (!Array.isArray(parsed)) {
        setImportError("JSON must be an array of question objects.");
        return;
      }
      const imported: QuizQuestion[] = [];
      for (const item of parsed) {
        if (
          typeof item !== "object" ||
          item === null ||
          typeof (item as Record<string, unknown>).questionText !== "string" ||
          typeof (item as Record<string, unknown>).questionType !== "string"
        ) {
          setImportError(
            "Each question must have at least questionText and questionType fields.",
          );
          return;
        }
        const q = item as Record<string, unknown>;
        imported.push({
          id: "",
          questionText: String(q.questionText),
          questionType: String(q.questionType) as QuestionType,
          options: Array.isArray(q.options)
            ? (q.options as Array<Record<string, string>>).map((o) => ({
                id: "",
                label: String(o.label ?? ""),
                text: String(o.text ?? ""),
              }))
            : [],
          correctAnswer: String(q.correctAnswer ?? ""),
          explanation: String(q.explanation ?? ""),
          points: typeof q.points === "number" ? q.points : 1,
          order: 0,
        });
      }
      dispatch({ type: "IMPORT_QUESTIONS", questions: imported });
      toast.success(`Imported ${imported.length} questions`);
      setImportText("");
      setIsOpen(false);
    } catch {
      setImportError("Invalid JSON format. Please check the syntax.");
    }
  }, [importText, dispatch]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.item(0);
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          setImportText(text);
          setImportError(null);
        }
      };
      reader.readAsText(file);
    },
    [],
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Import or export quiz questions"
        >
          <Download className="size-4" />
          Import / Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import / Export Questions</DialogTitle>
          <DialogDescription>
            Export questions as JSON for reuse, or import questions from a JSON
            file.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="export">
          <TabsList className="w-full">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          <TabsContent value="export" className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              {`Download all ${questions.length} questions as a JSON file.`}
            </p>
            <Button
              type="button"
              onClick={handleExport}
              disabled={questions.length === 0}
            >
              <Download className="size-4" />
              Download JSON
            </Button>
          </TabsContent>
          <TabsContent value="import" className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="size-4" />
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Choose JSON file to import"
              />
              <p className="text-xs text-muted-foreground">
                Or paste JSON below
              </p>
            </div>
            <Textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                setImportError(null);
              }}
              placeholder='[{"questionText": "...", "questionType": "multiple_choice", ...}]'
              className="min-h-[120px] font-mono text-xs"
              aria-label="Paste JSON questions"
            />
            {importError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                {importError}
              </div>
            )}
            <Button
              type="button"
              onClick={handleImport}
              disabled={importText.trim().length === 0}
            >
              <Upload className="size-4" />
              Import Questions
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Validation ----------

interface ValidationIssue {
  readonly questionId?: string;
  readonly message: string;
}

function validateQuiz(
  questions: ReadonlyArray<QuizQuestion>,
  settings: QuizSettings,
): ReadonlyArray<ValidationIssue> {
  const issues: ValidationIssue[] = [];

  if (settings.passingScore <= 0) {
    issues.push({ message: "Passing score must be greater than 0%." });
  }

  if (questions.length === 0) {
    issues.push({ message: "Quiz must have at least one question." });
  }

  for (const q of questions) {
    if (q.questionText.trim().length === 0) {
      issues.push({
        questionId: q.id,
        message: `Question ${q.order + 1}: Question text is empty.`,
      });
    }

    if (q.questionType === "multiple_choice") {
      if (q.correctAnswer.length === 0) {
        issues.push({
          questionId: q.id,
          message: `Question ${q.order + 1}: No correct answer selected for multiple choice.`,
        });
      }
      const emptyOptions = q.options.filter((o) => o.text.trim().length === 0);
      if (emptyOptions.length > 0) {
        issues.push({
          questionId: q.id,
          message: `Question ${q.order + 1}: ${emptyOptions.length} option(s) have empty text.`,
        });
      }
    }

    if (q.questionType === "true_false" && q.correctAnswer.length === 0) {
      issues.push({
        questionId: q.id,
        message: `Question ${q.order + 1}: No correct answer selected for true/false.`,
      });
    }

    if (
      q.questionType === "short_answer" &&
      q.correctAnswer.trim().length === 0
    ) {
      issues.push({
        questionId: q.id,
        message: `Question ${q.order + 1}: No acceptable answer provided for short answer.`,
      });
    }
  }

  return issues;
}

interface QuestionEditorPanelProps {
  readonly question: QuizQuestion | null;
  readonly dispatch: React.Dispatch<QuizAction>;
}

function QuestionEditorPanel({ question, dispatch }: QuestionEditorPanelProps) {
  if (!question) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="rounded-full bg-muted p-4">
          <Pencil className="size-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Select a question to edit</p>
          <p className="text-xs text-muted-foreground">
            Choose a question from the list on the left, or add a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {QUESTION_TYPE_LABELS[question.questionType]}
            </Badge>
            <Badge variant="secondary">
              {`${question.points} pt${question.points !== 1 ? "s" : ""}`}
            </Badge>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`question-text-${question.id}`}>Question Text</Label>
          <Textarea
            id={`question-text-${question.id}`}
            value={question.questionText}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_QUESTION",
                questionId: question.id,
                updates: { questionText: e.target.value },
              })
            }
            placeholder="Enter your question..."
            className="min-h-[100px]"
          />
        </div>

        <Separator />

        {question.questionType === "multiple_choice" && (
          <MultipleChoiceEditor question={question} dispatch={dispatch} />
        )}

        {question.questionType === "true_false" && (
          <TrueFalseEditor question={question} dispatch={dispatch} />
        )}

        {question.questionType === "short_answer" && (
          <ShortAnswerEditor question={question} dispatch={dispatch} />
        )}

        {question.questionType === "file_upload" && (
          <FileUploadEditor question={question} dispatch={dispatch} />
        )}

        <Separator />

        <div className="grid gap-2">
          <Label htmlFor={`points-${question.id}`}>Point Value</Label>
          <div className="flex items-center gap-3">
            <Slider
              id={`points-${question.id}`}
              min={1}
              max={10}
              step={1}
              value={[question.points]}
              onValueChange={(val) =>
                dispatch({
                  type: "UPDATE_QUESTION",
                  questionId: question.id,
                  updates: { points: val.at(0) ?? 1 },
                })
              }
              className="flex-1"
              aria-label="Point value"
            />
            <Badge variant="secondary" className="shrink-0">
              {`${question.points} pts`}
            </Badge>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Explanation</Label>
          <TipTapEditor
            content={question.explanation}
            onChange={(data) =>
              dispatch({
                type: "UPDATE_QUESTION",
                questionId: question.id,
                updates: { explanation: data.html },
              })
            }
            placeholder="Explain why this answer is correct (shown to students after submission)..."
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            Rich text explanation shown to students after submission for learning reinforcement.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}

// ---------- Settings Panel ----------

interface SettingsPanelProps {
  readonly settings: QuizSettings;
  readonly dispatch: React.Dispatch<QuizAction>;
}

function QuizSettingsPanel({ settings, dispatch }: SettingsPanelProps) {
  return (
    <div className="space-y-6 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Settings2 className="size-4" />
        Quiz Settings
      </h3>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="passing-score">Passing Score</Label>
          <Badge variant="secondary">{`${settings.passingScore}%`}</Badge>
        </div>
        <Slider
          id="passing-score"
          min={0}
          max={100}
          step={5}
          value={[settings.passingScore]}
          onValueChange={(val) =>
            dispatch({
              type: "UPDATE_SETTINGS",
              settings: { passingScore: val.at(0) ?? 70 },
            })
          }
          aria-label="Passing score percentage"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <Separator />

      <div className="grid gap-2">
        <Label htmlFor="time-limit">Time Limit (minutes)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="time-limit"
            type="number"
            min={0}
            max={180}
            value={settings.timeLimitMinutes ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              dispatch({
                type: "UPDATE_SETTINGS",
                settings: {
                  timeLimitMinutes:
                    val.length > 0 ? Number.parseInt(val, 10) : null,
                },
              });
            }}
            placeholder="No limit"
            className="w-24"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for unlimited time
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="max-attempts">Max Attempts</Label>
        <div className="flex items-center gap-2">
          <Input
            id="max-attempts"
            type="number"
            min={0}
            max={99}
            value={settings.maxAttempts ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              dispatch({
                type: "UPDATE_SETTINGS",
                settings: {
                  maxAttempts:
                    val.length > 0 ? Number.parseInt(val, 10) : null,
                },
              });
            }}
            placeholder="Unlimited"
            className="w-24"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for unlimited attempts
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="shuffle-questions">Shuffle Questions</Label>
          <p className="text-xs text-muted-foreground">
            Randomize question order for each attempt
          </p>
        </div>
        <Switch
          id="shuffle-questions"
          checked={settings.shuffleQuestions}
          onCheckedChange={(checked) =>
            dispatch({
              type: "UPDATE_SETTINGS",
              settings: { shuffleQuestions: checked },
            })
          }
          aria-label="Toggle shuffle questions"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="show-feedback">Show Feedback</Label>
          <p className="text-xs text-muted-foreground">
            Show explanations after quiz submission
          </p>
        </div>
        <Switch
          id="show-feedback"
          checked={settings.showFeedback}
          onCheckedChange={(checked) =>
            dispatch({
              type: "UPDATE_SETTINGS",
              settings: { showFeedback: checked },
            })
          }
          aria-label="Toggle show feedback"
        />
      </div>
    </div>
  );
}

// ---------- Preview Mode ----------

interface QuizPreviewProps {
  readonly questions: ReadonlyArray<QuizQuestion>;
  readonly settings: QuizSettings;
  readonly previewAnswers: Readonly<Record<string, string>>;
  readonly isSubmitted: boolean;
  readonly dispatch: React.Dispatch<QuizAction>;
}

function QuizPreview({
  questions,
  settings,
  previewAnswers,
  isSubmitted,
  dispatch,
}: QuizPreviewProps) {
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = isSubmitted
    ? questions.reduce((sum, q) => {
        const answer = previewAnswers[q.id] ?? "";
        if (q.questionType === "short_answer") {
          const acceptableAnswers = q.correctAnswer.split("||");
          const isCorrect = acceptableAnswers.some(
            (a) => a.trim().toLowerCase() === answer.trim().toLowerCase(),
          );
          return sum + (isCorrect ? q.points : 0);
        }
        return sum + (answer === q.correctAnswer ? q.points : 0);
      }, 0)
    : 0;
  const scorePercent =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const isPassing = scorePercent >= settings.passingScore;

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Preview</CardTitle>
            <CardDescription>
              This is how students will see the quiz.
              {settings.timeLimitMinutes
                ? ` Time limit: ${settings.timeLimitMinutes} minutes.`
                : ""}
            </CardDescription>
          </CardHeader>
          {isSubmitted && (
            <CardContent>
              <div
                className={cn(
                  "rounded-lg border p-4",
                  isPassing
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                    : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {isPassing ? "Passed!" : "Not passing"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {`${earnedPoints} / ${totalPoints} points (${scorePercent}%)`}
                    </p>
                  </div>
                  <Badge variant={isPassing ? "default" : "destructive"}>
                    {`${scorePercent}%`}
                  </Badge>
                </div>
                <Progress
                  value={scorePercent}
                  className="mt-3"
                  aria-label="Quiz score"
                />
              </div>
            </CardContent>
          )}
        </Card>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const answer = previewAnswers[q.id] ?? "";
            const isCorrectFn = (): boolean => {
              if (q.questionType === "short_answer") {
                const acceptableAnswers = q.correctAnswer.split("||");
                return acceptableAnswers.some(
                  (a) =>
                    a.trim().toLowerCase() === answer.trim().toLowerCase(),
                );
              }
              return answer === q.correctAnswer;
            };
            const isCorrect = isSubmitted && isCorrectFn();
            const isWrong = isSubmitted && !isCorrectFn();

            return (
              <Card
                key={q.id}
                className={cn(
                  isSubmitted && isCorrect && "border-green-300 dark:border-green-700",
                  isSubmitted && isWrong && "border-red-300 dark:border-red-700",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{`Q${idx + 1}`}</Badge>
                    <Badge variant="secondary">
                      {`${q.points} pt${q.points !== 1 ? "s" : ""}`}
                    </Badge>
                    {isSubmitted && isCorrect && (
                      <Badge variant="default" className="bg-green-600">
                        Correct
                      </Badge>
                    )}
                    {isSubmitted && isWrong && (
                      <Badge variant="destructive">Incorrect</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base">{q.questionText}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {q.questionType === "multiple_choice" && (
                    <RadioGroup
                      value={answer}
                      onValueChange={(val) =>
                        dispatch({
                          type: "SET_PREVIEW_ANSWER",
                          questionId: q.id,
                          answer: val,
                        })
                      }
                      disabled={isSubmitted}
                      className="space-y-2"
                    >
                      {q.options.map((opt) => {
                        const isThisCorrect =
                          isSubmitted && opt.label === q.correctAnswer;
                        const isThisWrong =
                          isSubmitted &&
                          answer === opt.label &&
                          opt.label !== q.correctAnswer;

                        return (
                          <label
                            key={opt.id}
                            htmlFor={`preview-opt-${opt.id}`}
                            className={cn(
                              "flex items-center gap-3 rounded-md border p-3 transition-colors",
                              !isSubmitted && "cursor-pointer hover:bg-accent/50",
                              isThisCorrect && "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950",
                              isThisWrong && "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950",
                            )}
                          >
                            <RadioGroupItem
                              value={opt.label}
                              id={`preview-opt-${opt.id}`}
                            />
                            <Badge variant="outline" className="shrink-0">
                              {opt.label}
                            </Badge>
                            <span className="text-sm">{opt.text}</span>
                            {isThisCorrect && (
                              <Check className="ml-auto size-4 text-green-600" />
                            )}
                          </label>
                        );
                      })}
                    </RadioGroup>
                  )}

                  {q.questionType === "true_false" && (
                    <RadioGroup
                      value={answer}
                      onValueChange={(val) =>
                        dispatch({
                          type: "SET_PREVIEW_ANSWER",
                          questionId: q.id,
                          answer: val,
                        })
                      }
                      disabled={isSubmitted}
                      className="flex gap-4"
                    >
                      {q.options.map((opt) => {
                        const isThisCorrect =
                          isSubmitted && opt.label === q.correctAnswer;
                        const isThisWrong =
                          isSubmitted &&
                          answer === opt.label &&
                          opt.label !== q.correctAnswer;

                        return (
                          <label
                            key={opt.id}
                            htmlFor={`preview-tf-${opt.id}`}
                            className={cn(
                              "flex flex-1 items-center justify-center gap-2 rounded-lg border p-4 transition-colors",
                              !isSubmitted && "cursor-pointer hover:bg-accent/50",
                              answer === opt.label && !isSubmitted && "border-primary bg-primary/5",
                              isThisCorrect && "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950",
                              isThisWrong && "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950",
                            )}
                          >
                            <RadioGroupItem
                              value={opt.label}
                              id={`preview-tf-${opt.id}`}
                            />
                            <span className="text-sm font-medium">
                              {opt.label}
                            </span>
                          </label>
                        );
                      })}
                    </RadioGroup>
                  )}

                  {q.questionType === "short_answer" && (
                    <Textarea
                      value={answer}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_PREVIEW_ANSWER",
                          questionId: q.id,
                          answer: e.target.value,
                        })
                      }
                      disabled={isSubmitted}
                      placeholder="Type your answer here..."
                      className="min-h-[80px]"
                      aria-label={`Answer for question ${idx + 1}`}
                    />
                  )}

                  {q.questionType === "file_upload" && (
                    <div
                      className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/25 p-6"
                      role="region"
                      aria-label="File upload area"
                    >
                      <Upload className="size-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {q.fileUploadConfig?.instructions ??
                          "Drag and drop your file here, or click to browse."}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {(q.fileUploadConfig?.allowedTypes ?? []).join(", ")}
                      </Badge>
                      {answer.length > 0 ? (
                        <Badge variant="default" className="text-xs">
                          File selected (preview)
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSubmitted}
                          onClick={() =>
                            dispatch({
                              type: "SET_PREVIEW_ANSWER",
                              questionId: q.id,
                              answer: "sample-file.pdf",
                            })
                          }
                          aria-label="Simulate file upload"
                        >
                          <Upload className="size-4" />
                          Choose File
                        </Button>
                      )}
                    </div>
                  )}

                  {isSubmitted && settings.showFeedback && q.explanation.length > 0 && (
                    <div className="rounded-md border bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Explanation
                      </p>
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-sm"
                        dangerouslySetInnerHTML={{ __html: q.explanation }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
          {!isSubmitted ? (
            <Button
              type="button"
              onClick={() => dispatch({ type: "SUBMIT_PREVIEW" })}
              disabled={
                Object.keys(previewAnswers).length < questions.length
              }
            >
              <Check className="size-4" />
              Submit Quiz
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: "RESET_PREVIEW" })}
            >
              Retake Quiz
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            {!isSubmitted
              ? `${Object.keys(previewAnswers).length} of ${questions.length} answered`
              : `Score: ${scorePercent}% (${isPassing ? "Pass" : "Fail"})`}
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}

// ---------- Main Page ----------

function QuizBuilderPage() {
  const { courseId, lessonId } = Route.useParams();
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [activeTab, setActiveTab] = useState<string>("editor");

  const selectedQuestion =
    state.questions.find((q) => q.id === state.selectedQuestionId) ?? null;

  const handleSave = useCallback(async () => {
    const issues = validateQuiz(state.questions, state.settings);
    if (issues.length > 0) {
      for (const issue of issues) {
        toast.error(issue.message);
      }
      if (issues.at(0)?.questionId) {
        dispatch({
          type: "SELECT_QUESTION",
          questionId: issues.at(0)?.questionId ?? null,
        });
      }
      return;
    }
    dispatch({ type: "SET_SAVING", value: true });
    // Simulate API call
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1_500);
    });
    dispatch({ type: "SET_SAVING", value: false });
    toast.success("Quiz saved successfully");
  }, [state.questions, state.settings]);

  const handleGenerateWithAI = useCallback(async () => {
    dispatch({ type: "SET_GENERATING", value: true });
    // Simulate AI generation delay
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 2_500);
    });
    dispatch({ type: "LOAD_GENERATED_QUIZ", quiz: MOCK_GENERATED_QUIZ });
  }, []);

  const handleTogglePreview = useCallback(() => {
    dispatch({ type: "TOGGLE_PREVIEW" });
    setActiveTab(state.isPreviewMode ? "editor" : "preview");
  }, [state.isPreviewMode]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col -my-6 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Top toolbar */}
      <header className="flex items-center gap-3 border-b bg-background px-4 py-2">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link
            to="/dashboard/courses/$id/edit"
            params={{ id: courseId }}
            aria-label="Back to course editor"
          >
            <ArrowLeft className="size-4" />
            Course
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-sm font-semibold">Quiz Builder</h1>
          <p className="text-xs text-muted-foreground">
            {`Course ${courseId} / Lesson ${lessonId}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateWithAI}
            disabled={state.isGenerating}
            aria-label="Generate quiz questions with AI"
          >
            {state.isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate with AI
              </>
            )}
          </Button>
          <ImportExportDialog
            questions={state.questions}
            dispatch={dispatch}
          />
          <Button
            type="button"
            variant={state.isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={handleTogglePreview}
            aria-label={state.isPreviewMode ? "Exit preview mode" : "Enter preview mode"}
          >
            {state.isPreviewMode ? (
              <>
                <EyeOff className="size-4" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye className="size-4" />
                Preview
              </>
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={state.isSaving}
          >
            {state.isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main content */}
      {state.isPreviewMode ? (
        <div className="flex-1 overflow-hidden">
          <QuizPreview
            questions={state.questions}
            settings={state.settings}
            previewAnswers={state.previewAnswers}
            isSubmitted={state.previewSubmitted}
            dispatch={dispatch}
          />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Question list */}
          <div className="w-80 shrink-0 border-r">
            <QuestionListPanel
              questions={state.questions}
              selectedQuestionId={state.selectedQuestionId}
              dispatch={dispatch}
            />
          </div>

          {/* Center + Right: Editor or Settings */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b px-4 pt-2">
                <TabsList>
                  <TabsTrigger value="editor">
                    <Pencil className="size-3.5" />
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings2 className="size-3.5" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="editor" className="h-[calc(100%-3rem)] mt-0">
                <QuestionEditorPanel
                  question={selectedQuestion}
                  dispatch={dispatch}
                />
              </TabsContent>
              <TabsContent value="settings" className="h-[calc(100%-3rem)] mt-0">
                <ScrollArea className="h-full">
                  <QuizSettingsPanel
                    settings={state.settings}
                    dispatch={dispatch}
                  />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
