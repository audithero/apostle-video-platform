import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/lib/trpc/react";
import { STARTER_TEMPLATES } from "@/lib/sdui/starter-templates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutTemplate,
  ArrowLeft,
  ArrowRight,
  Loader2,
  GraduationCap,
  Home,
  Play,
  Users,
  DollarSign,
  BarChart3,
  Trophy,
  Radio,
  HelpCircle,
  ChefHat,
  Dumbbell,
  Landmark,
  TrendingUp,
  Palette,
} from "lucide-react";

export const Route = createFileRoute("/_authed/dashboard/templates/new")({
  component: NewTemplatePage,
});

/* ------------------------------------------------------------------ */
/*  Icon mapping                                                       */
/* ------------------------------------------------------------------ */

const iconMap: Record<string, typeof LayoutTemplate> = {
  GraduationCap,
  Home,
  Play,
  Users,
  DollarSign,
  BarChart3,
  Trophy,
  Radio,
  ChefHat,
  Dumbbell,
  Landmark,
  TrendingUp,
  Palette,
};

function getIcon(iconName: string) {
  return iconMap[iconName] ?? HelpCircle;
}

/* ------------------------------------------------------------------ */
/*  New Template Page                                                  */
/* ------------------------------------------------------------------ */

function NewTemplatePage() {
  const navigate = useNavigate();
  const trpc = useTRPC();

  const [step, setStep] = useState<"choose" | "details">("choose");
  const [selectedStarter, setSelectedStarter] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("landing");

  const createMutation = useMutation(
    trpc.sdui.templates.create.mutationOptions({
      onSuccess: (result) => {
        navigate({
          to: "/dashboard/templates/$id/edit",
          params: { id: result.id },
        });
      },
    }),
  );

  const handleCreate = () => {
    const starter = STARTER_TEMPLATES.find((s) => s.id === selectedStarter);

    // Use full SDUI screen from starter template, or create a blank one
    const templateJson = starter
      ? {
          ...starter.screen,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description,
        }
      : {
          id: `template-${Date.now()}`,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description,
          sections: [],
        };

    createMutation.mutate({
      name,
      description,
      category: category as "landing" | "learning" | "community" | "commerce" | "dashboard" | "general",
      templateJson,
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            if (step === "details") {
              setStep("choose");
            } else {
              navigate({ to: "/dashboard/templates" });
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Template</h1>
          <p className="text-sm text-neutral-500">
            {step === "choose"
              ? "Choose a starter template or start from scratch"
              : "Name your template and set its category"}
          </p>
        </div>
      </div>

      {step === "choose" ? (
        <>
          {/* Blank template option */}
          <Card
            className={`cursor-pointer border-2 transition-colors ${
              selectedStarter === "blank"
                ? "border-[var(--color-primary,#6366f1)]"
                : "border-transparent hover:border-neutral-200"
            }`}
            onClick={() => setSelectedStarter("blank")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <LayoutTemplate className="h-6 w-6 text-neutral-500" />
              </div>
              <div>
                <div className="font-semibold">Blank Template</div>
                <p className="text-sm text-neutral-500">
                  Start with an empty canvas and build from scratch
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Starter templates */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {STARTER_TEMPLATES.map((starter) => {
              const Icon = getIcon(starter.icon);
              const sectionTypes = starter.screen.sections.map((s) => s.type);
              return (
                <Card
                  key={starter.id}
                  className={`cursor-pointer border-2 transition-colors ${
                    selectedStarter === starter.id
                      ? "border-[var(--color-primary,#6366f1)]"
                      : "border-transparent hover:border-neutral-200"
                  }`}
                  onClick={() => setSelectedStarter(starter.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                        <Icon className="h-5 w-5 text-neutral-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{starter.name}</div>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {starter.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {sectionTypes.slice(0, 4).map((s, i) => (
                            <span
                              key={`${s}-${String(i)}`}
                              className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500 dark:bg-neutral-800"
                            >
                              {s}
                            </span>
                          ))}
                          {sectionTypes.length > 4 && (
                            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500 dark:bg-neutral-800">
                              +{String(sectionTypes.length - 4)} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Next button */}
          <div className="flex justify-end">
            <Button
              disabled={!selectedStarter}
              onClick={() => {
                const starter = STARTER_TEMPLATES.find(
                  (s) => s.id === selectedStarter,
                );
                if (starter) {
                  setName(starter.name);
                  setDescription(starter.description);
                  setCategory(starter.category);
                }
                setStep("details");
              }}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Course Landing Page"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this template is for..."
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="template-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="template-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landing">Landing Page</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="commerce">Commerce</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("choose")}>
                Back
              </Button>
              <Button
                disabled={!name.trim() || createMutation.isPending}
                onClick={handleCreate}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Template"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
