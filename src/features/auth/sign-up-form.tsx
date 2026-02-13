import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { useTranslation } from "@/lib/intl/react";
import { convertImageToBase64 } from "@/lib/utils";

const signUpSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirmation: z.string(),
    image: z.instanceof(File).optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "The two passwords do not match.",
    path: ["passwordConfirmation"],
  });

export function SignUpForm() {
  const { t } = useTranslation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      image: undefined as File | undefined,
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = form;

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        image: data.image ? await convertImageToBase64(data.image) : "",
        callbackURL: "/dashboard",
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: async () => {
            navigate({ to: "/dashboard" });
          },
        },
      });
    } catch {
      toast.error("An error occurred during sign up");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.at(0);
    if (file) {
      setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setValue("image", undefined);
    setImagePreview(null);
  };

  return (
    <div className="w-full max-w-md">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Create your account
        </h1>
        <p className="mt-2 text-muted-foreground">
          Start building your learning platform today
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
        <div className="grid gap-5">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            disabled={googleLoading}
            onClick={async () => {
              setGoogleLoading(true);
              await authClient.signIn.social({
                provider: "google",
                callbackURL: "/dashboard",
              });
              setGoogleLoading(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.currentTarget.click();
              }
            }}
          >
            {googleLoading ? (
              <Spinner />
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <title>Google logo</title>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
        </div>

        <form className="mt-5 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName">{t("FIRST_NAME")}</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="firstName"
                      placeholder="Max"
                      {...register("firstName")}
                    />
                  </InputGroup>
                  <FieldError errors={errors.firstName ? [errors.firstName] : undefined} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="lastName">{t("LAST_NAME")}</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="lastName"
                      placeholder="Robinson"
                      {...register("lastName")}
                    />
                  </InputGroup>
                  <FieldError errors={errors.lastName ? [errors.lastName] : undefined} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">{t("EMAIL")}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                </InputGroup>
                <FieldError errors={errors.email ? [errors.email] : undefined} />
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">{t("PASSWORD")}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    {...register("password")}
                  />
                </InputGroup>
                <FieldError errors={errors.password ? [errors.password] : undefined} />
              </Field>

              <Field>
                <FieldLabel htmlFor="passwordConfirmation">{t("CONFIRM_PASSWORD")}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="passwordConfirmation"
                    type="password"
                    placeholder="Confirm your password"
                    {...register("passwordConfirmation")}
                  />
                </InputGroup>
                <FieldError errors={errors.passwordConfirmation ? [errors.passwordConfirmation] : undefined} />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field>
            <FieldLabel>{t("PROFILE_IMAGE")}</FieldLabel>
            <FieldContent>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-border"
                    width={56}
                    height={56}
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") clearImage(); }}
                    className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </FieldContent>
          </Field>

          <Button type="submit" className="w-full rounded-full mt-1" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="size-4" /> : t("CREATE_ACCOUNT")}
          </Button>
        </form>
      </div>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-medium text-primary hover:text-primary/80 transition-colors" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
