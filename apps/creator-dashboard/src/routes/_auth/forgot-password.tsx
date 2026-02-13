import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthHelpers } from "@/features/auth/auth-hooks";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuthHelpers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    forgotPassword.mutate(
      { email },
      {
        onSuccess: () => {
          setSent(true);
          toast.success("Password reset email sent!");
        },
        onError: () => {
          toast.error("Failed to send reset email. Please try again.");
        },
      }
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              If an account exists with that email, you'll receive a password
              reset link shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={forgotPassword.isPending}>
              {forgotPassword.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          to="/login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}
