import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useLogin } from "@/features/auth/auth-hooks";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export default function SignInForm() {
  const { loginWithCredentials } = useLogin();

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = (data: z.infer<typeof signInSchema>) => {
    loginWithCredentials.mutate({
      email: data.email,
      password: data.password,
      rememberMe: !!data.rememberMe,
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Welcome back
        </h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to continue to your account
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
        <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
          {loginWithCredentials.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {loginWithCredentials.error.message || "Login failed. Please check your credentials and try again."}
              </AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <InputGroup>
              <InputGroupInput id="email" placeholder="you@example.com" type="email" {...register("email")} />
            </InputGroup>
            <FieldError errors={errors.email ? [{ message: errors.email.message }] : undefined} />
          </Field>

          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link className="ml-auto text-sm font-medium text-primary hover:text-primary/80 transition-colors" to="/forgot-password">
                Forgot password?
              </Link>
            </div>
            <InputGroup>
              <InputGroupInput id="password" placeholder="Enter your password" type="password" {...register("password")} />
            </InputGroup>
            <FieldError errors={errors.password?.message ? [{ message: errors.password.message }] : undefined} />
          </Field>

          <Field orientation="horizontal">
            <Checkbox
              checked={form.watch("rememberMe")}
              id="remember"
              onCheckedChange={(checked) => form.setValue("rememberMe", !!checked)}
            />
            <FieldLabel
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="remember"
            >
              Remember me
            </FieldLabel>
          </Field>

          <Button
            className="w-full rounded-full mt-1"
            disabled={isSubmitting || loginWithCredentials.isPending}
            type="submit"
          >
            {loginWithCredentials.isPending || isSubmitting ? <Spinner /> : "Sign In"}
          </Button>
        </form>
      </div>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link className="font-medium text-primary hover:text-primary/80 transition-colors" to="/register">
          Create one
        </Link>
      </p>
    </div>
  );
}
