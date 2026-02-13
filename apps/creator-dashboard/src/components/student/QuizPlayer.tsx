import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionRenderer } from "./QuestionRenderer";

interface QuizPlayerProps {
  readonly lessonId: string;
  readonly courseId: string;
  readonly onComplete?: () => void;
}

type QuizPhase = "intro" | "active" | "results";

interface QuizResults {
  readonly scorePercent: number;
  readonly passed: boolean;
  readonly questionResults: Record<string, { correct: boolean; correctAnswer: string | string[] | null }>;
  readonly passingScorePercent: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function QuizPlayer({ lessonId, courseId, onComplete }: QuizPlayerProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: quizData, isLoading: isLoadingQuiz } = useQuery(
    trpc.enrollments.getQuizForStudent.queryOptions({ lessonId }),
  );

  const quizId = quizData?.id ?? "";

  const attemptsQueryOptions = trpc.enrollments.getQuizAttempts.queryOptions(
    { courseId, quizId },
  );
  const { data: attempts, isLoading: isLoadingAttempts } = useQuery({
    ...attemptsQueryOptions,
    enabled: quizId.length > 0,
  });

  const submitMutation = useMutation(
    trpc.enrollments.submitQuizWithScoring.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.enrollments.getQuizAttempts.queryKey({ courseId, quizId }),
        });
      },
    }),
  );

  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [results, setResults] = useState<QuizResults | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const questions = quizData?.questions ?? [];
  const currentQuestion = questions.at(currentQuestionIndex);
  const totalQuestions = questions.length;
  const maxAttempts = quizData?.maxAttempts;
  const attemptCount = attempts?.length ?? 0;
  const canRetry = maxAttempts === null || maxAttempts === undefined || attemptCount < maxAttempts;
  const bestAttempt = attempts?.find((a) => a.passed) ?? attempts?.at(0);

  // Timer logic
  useEffect(() => {
    if (phase !== "active" || timeRemaining === null) return;

    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1_000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeRemaining === null]);

  const startQuiz = useCallback(() => {
    setPhase("active");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResults(null);
    if (quizData?.timeLimitMinutes) {
      setTimeRemaining(quizData.timeLimitMinutes * 60);
    }
  }, [quizData?.timeLimitMinutes]);

  const handleAnswer = useCallback((questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    submitMutation.mutate(
      { courseId, quizId, answers },
      {
        onSuccess: (data) => {
          if (data) {
            setResults({
              scorePercent: data.scorePercent,
              passed: data.passed,
              questionResults: data.questionResults,
              passingScorePercent: data.passingScorePercent,
            });
            setPhase("results");
            onComplete?.();
          }
        },
      },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, quizId, answers, submitMutation, onComplete]);

  if (isLoadingQuiz || isLoadingAttempts) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <XCircle className="size-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-medium">Quiz Not Found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This lesson does not have an associated quiz.
        </p>
      </div>
    );
  }

  // Intro phase
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{quizData.title}</h2>
          <p className="mt-2 text-muted-foreground">
            {`${String(totalQuestions)} question${totalQuestions === 1 ? "" : "s"}`}
          </p>
        </div>

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Passing score</span>
            <span className="font-medium">{`${String(quizData.passingScorePercent ?? 70)}%`}</span>
          </div>
          {quizData.timeLimitMinutes && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Time limit</span>
              <span className="font-medium">{`${String(quizData.timeLimitMinutes)} minutes`}</span>
            </div>
          )}
          {maxAttempts !== null && maxAttempts !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Attempts</span>
              <span className="font-medium">{`${String(attemptCount)} / ${String(maxAttempts)}`}</span>
            </div>
          )}
        </div>

        {bestAttempt && (
          <>
            <Separator />
            <div className="rounded-lg border p-4 text-center">
              <p className="text-sm text-muted-foreground">Best score</p>
              <p className="mt-1 text-2xl font-bold">
                {`${String(bestAttempt.scorePercent ?? 0)}%`}
              </p>
              {bestAttempt.passed ? (
                <Badge className="mt-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="mr-1 size-3" />
                  Passed
                </Badge>
              ) : (
                <Badge variant="destructive" className="mt-2">
                  <XCircle className="mr-1 size-3" />
                  Not Passed
                </Badge>
              )}
            </div>
          </>
        )}

        <Button
          type="button"
          className="w-full"
          size="lg"
          disabled={!canRetry}
          onClick={startQuiz}
        >
          {attemptCount === 0 ? "Start Quiz" : "Retry Quiz"}
        </Button>

        {!canRetry && (
          <p className="text-center text-sm text-muted-foreground">
            You have used all available attempts.
          </p>
        )}
      </div>
    );
  }

  // Results phase
  if (phase === "results" && results) {
    return (
      <div className="space-y-6 p-6">
        {/* Score header */}
        <div className="text-center">
          {results.passed ? (
            <Trophy className="mx-auto size-16 text-amber-500" />
          ) : (
            <XCircle className="mx-auto size-16 text-red-500" />
          )}
          <h2 className="mt-4 text-3xl font-bold">
            {`${String(results.scorePercent)}%`}
          </h2>
          <div className="mt-2">
            {results.passed ? (
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="mr-1 size-3" />
                Passed
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="mr-1 size-3" />
                {`Not Passed (need ${String(results.passingScorePercent)}%)`}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Question-by-question results */}
        <div className="space-y-6">
          <h3 className="font-semibold">Review Answers</h3>
          {questions.map((q, idx) => {
            const result = results.questionResults[q.id];
            return (
              <div key={q.id} className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {`Question ${String(idx + 1)}`}
                </p>
                <QuestionRenderer
                  question={q}
                  selectedAnswer={answers[q.id]}
                  onAnswer={() => {}}
                  disabled
                  showResult={result}
                />
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Retry button */}
        <div className="flex justify-center">
          {canRetry ? (
            <Button type="button" onClick={startQuiz} size="lg">
              <RotateCcw className="mr-2 size-4" />
              Retry Quiz
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              You have used all available attempts.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Active quiz phase
  return (
    <div className="flex h-full flex-col">
      {/* Quiz header with progress and timer */}
      <div className="border-b bg-background px-6 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {`Question ${String(currentQuestionIndex + 1)} of ${String(totalQuestions)}`}
          </span>
          {timeRemaining !== null && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm font-mono",
                timeRemaining <= 60 && "text-red-600 dark:text-red-400",
              )}
            >
              <Clock className="size-4" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <Progress
          value={((currentQuestionIndex + 1) / totalQuestions) * 100}
          className="mt-2 h-1.5"
          aria-label={`Quiz progress: question ${String(currentQuestionIndex + 1)} of ${String(totalQuestions)}`}
        />
      </div>

      {/* Question content */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentQuestion && (
          <QuestionRenderer
            question={currentQuestion}
            selectedAnswer={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
          />
        )}
      </div>

      {/* Navigation footer */}
      <div className="border-t bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Previous
          </Button>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button
              type="button"
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            >
              Next
              <ArrowRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
