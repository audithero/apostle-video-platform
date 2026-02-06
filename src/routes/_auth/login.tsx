import { createFileRoute } from "@tanstack/react-router";
import SignInForm from "@/features/auth/sign-in-form";

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});

function LoginPage() {
  return <SignInForm />;
}
