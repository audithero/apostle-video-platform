import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuestionData {
  readonly id: string;
  readonly questionText: string;
  readonly questionType: "multiple_choice" | "true_false" | "short_answer" | "file_upload";
  readonly options: string[] | null;
  readonly points: number;
  readonly sortOrder: number;
}

interface QuestionRendererProps {
  readonly question: QuestionData;
  readonly selectedAnswer: string | string[] | undefined;
  readonly onAnswer: (questionId: string, answer: string | string[]) => void;
  readonly disabled?: boolean;
  readonly showResult?: {
    readonly correct: boolean;
    readonly correctAnswer: string | string[] | null;
  };
}

export function QuestionRenderer({
  question,
  selectedAnswer,
  onAnswer,
  disabled = false,
  showResult,
}: QuestionRendererProps) {
  const currentValue = typeof selectedAnswer === "string" ? selectedAnswer : "";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-base font-medium leading-relaxed">{question.questionText}</p>
        <Badge variant="outline" className="shrink-0">
          {`${String(question.points)} ${question.points === 1 ? "pt" : "pts"}`}
        </Badge>
      </div>

      {question.questionType === "multiple_choice" && question.options && (
        <RadioGroup
          value={currentValue}
          onValueChange={(value) => onAnswer(question.id, value)}
          disabled={disabled}
          aria-label={`Options for: ${question.questionText}`}
        >
          {question.options.map((option, idx) => {
            const optionId = `${question.id}-option-${String(idx)}`;
            const isSelected = currentValue === option;
            const isCorrectAnswer = showResult?.correctAnswer === option;
            const isWrong = showResult && isSelected && !showResult.correct;

            return (
              <div
                key={optionId}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  isSelected && !showResult && "border-primary bg-primary/5",
                  showResult && isCorrectAnswer && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                  isWrong && "border-red-500 bg-red-50 dark:bg-red-950/30",
                  !disabled && !showResult && "cursor-pointer hover:bg-accent/50",
                )}
              >
                <RadioGroupItem value={option} id={optionId} />
                <Label
                  htmlFor={optionId}
                  className={cn(
                    "flex-1 cursor-pointer font-normal",
                    disabled && "cursor-default",
                  )}
                >
                  {option}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      )}

      {question.questionType === "true_false" && (
        <RadioGroup
          value={currentValue}
          onValueChange={(value) => onAnswer(question.id, value)}
          disabled={disabled}
          aria-label={`True or false: ${question.questionText}`}
        >
          {["True", "False"].map((option) => {
            const optionId = `${question.id}-${option.toLowerCase()}`;
            const isSelected = currentValue === option;
            const isCorrectAnswer = showResult?.correctAnswer === option;
            const isWrong = showResult && isSelected && !showResult.correct;

            return (
              <div
                key={optionId}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  isSelected && !showResult && "border-primary bg-primary/5",
                  showResult && isCorrectAnswer && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                  isWrong && "border-red-500 bg-red-50 dark:bg-red-950/30",
                  !disabled && !showResult && "cursor-pointer hover:bg-accent/50",
                )}
              >
                <RadioGroupItem value={option} id={optionId} />
                <Label
                  htmlFor={optionId}
                  className={cn(
                    "flex-1 cursor-pointer font-normal",
                    disabled && "cursor-default",
                  )}
                >
                  {option}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      )}

      {question.questionType === "short_answer" && (
        <div>
          <Label htmlFor={`${question.id}-answer`} className="sr-only">
            Your answer
          </Label>
          <Textarea
            id={`${question.id}-answer`}
            placeholder="Type your answer here..."
            value={currentValue}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            disabled={disabled}
            rows={3}
            className="resize-none"
          />
        </div>
      )}

      {question.questionType === "file_upload" && (
        <div className="rounded-lg border-2 border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            File upload will be available soon.
          </p>
        </div>
      )}

      {showResult && (
        <div
          className={cn(
            "rounded-lg p-3 text-sm",
            showResult.correct
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300",
          )}
        >
          {showResult.correct ? "Correct!" : "Incorrect"}
          {!showResult.correct && showResult.correctAnswer && (
            <span className="ml-1">
              {` - Correct answer: ${Array.isArray(showResult.correctAnswer) ? showResult.correctAnswer.join(", ") : showResult.correctAnswer}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
