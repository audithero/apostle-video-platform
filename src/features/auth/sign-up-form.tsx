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
        <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
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
