import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordForm from "@/features/auth/reset-password";

export const Route = createFileRoute("/_auth/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
