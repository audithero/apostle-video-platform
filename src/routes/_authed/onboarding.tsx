import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="container flex max-w-lg flex-col items-center py-16">
      <h1 className="text-3xl font-bold">Welcome to Apostle</h1>
      <p className="mt-2 text-muted-foreground">
        Set up your creator profile to get started.
      </p>

      <Card className="mt-8 w-full">
        <CardHeader>
          <CardTitle>Creator Profile</CardTitle>
          <CardDescription>
            Choose a name and URL for your creator page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="My Awesome Business"
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
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>apostle.tv/</span>
                <Input
                  id="slug"
                  placeholder="my-business"
                  className="flex-1"
                  {...register("slug")}
                />
              </div>
              {errors.slug && (
                <p className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={createProfile.isPending}>
              {createProfile.isPending ? "Creating..." : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
