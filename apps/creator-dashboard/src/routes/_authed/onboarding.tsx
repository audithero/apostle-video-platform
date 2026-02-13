import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Rocket } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/lib/trpc/react";
import { isCreator } from "@/lib/auth/permissions";

const onboardingSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(200),
  slug: z.string().min(1, "URL slug is required").max(100),
});

export const Route = createFileRoute("/_authed/onboarding")({
  beforeLoad: async ({ context }) => {
    const session = context.session;
    if (session?.user && isCreator(session.user.role as string | undefined)) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: OnboardingPage,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function OnboardingPage() {
  const trpc = useTRPC();

  const createProfile = useMutation(
    trpc.creatorSettings.createProfile.mutationOptions({
      onSuccess: () => {
        toast.success("Creator profile created!");
        window.location.href = "/dashboard";
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create profile");
      },
    }),
  );

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: "",
      slug: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentSlug = watch("slug");
    const expectedSlug = slugify(watch("businessName"));

    register("businessName").onChange(e);

    if (currentSlug === "" || currentSlug === expectedSlug) {
      setValue("slug", slugify(value));
    }
  };

  const onSubmit = (data: z.infer<typeof onboardingSchema>) => {
    createProfile.mutate({
      businessName: data.businessName,
      slug: data.slug,
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Welcome header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gaspar-lavender/20">
            <Rocket className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Welcome to Apostle
          </h1>
          <p className="mt-2 text-muted-foreground">
            Set up your creator profile to start building courses
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
              Creator Profile
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a name and URL for your creator page.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="My Awesome Business"
                className="h-11"
                {...register("businessName")}
                onChange={handleBusinessNameChange}
              />
              {errors.businessName && (
                <p className="text-sm text-destructive">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Your URL</Label>
              <div className="flex items-center gap-0 rounded-lg border border-input bg-muted/30 focus-within:ring-2 focus-within:ring-ring">
                <span className="shrink-0 border-r border-input bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
                  apostle.tv/
                </span>
                <Input
                  id="slug"
                  placeholder="my-business"
                  className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
                  {...register("slug")}
                />
              </div>
              {errors.slug && (
                <p className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-full mt-2"
              disabled={createProfile.isPending}
            >
              {createProfile.isPending ? "Creating..." : "Launch Your Profile"}
            </Button>
          </form>
        </div>

        {/* Subtle bottom note */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can always change these settings later in your dashboard.
        </p>
      </div>
    </div>
  );
}
