import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/features/auth/sign-up-form";

export const Route = createFileRoute("/_auth/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return <SignUpForm />;
}
