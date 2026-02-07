import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";

export const Route = createFileRoute("/_auth/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided.");
      return;
    }

    authClient.verifyEmail({ token }).then(
      () => setStatus("success"),
      (err: Error) => {
        setStatus("error");
        setErrorMessage(err.message || "Verification failed. The link may have expired.");
      }
    );
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
        <CardDescription>
          {status === "loading" && "Verifying your email address..."}
          {status === "success" && "Your email has been verified!"}
          {status === "error" && "Verification failed"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {status === "loading" && <Spinner />}
        {status === "success" && (
          <>
            <p className="text-sm text-muted-foreground text-center">
              Your email address has been successfully verified. You can now sign in to your account.
            </p>
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-sm text-destructive text-center">{errorMessage}</p>
            <Button variant="outline" asChild>
              <Link to="/login">Back to Login</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
