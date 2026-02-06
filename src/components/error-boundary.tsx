import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link, useRouter } from "@tanstack/react-router";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Reusable error boundary component for TanStack Router routes.
 * Receives { error, reset } props from the router's errorComponent.
 */
export function RouteErrorBoundary({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const queryErrorBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorBoundary.reset();
  }, [queryErrorBoundary]);

  const isDev = process.env.NODE_ENV !== "production";

  const handleRetry = () => {
    queryErrorBoundary.reset();
    reset();
    router.invalidate();
  };

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Please try again or return to the
            home page.
          </CardDescription>
        </CardHeader>

        {isDev && error instanceof Error && (
          <CardContent>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm font-medium text-destructive">
                {error.message}
              </p>
              {error.stack && (
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                  {error.stack}
                </pre>
              )}
            </div>
          </CardContent>
        )}

        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" onClick={handleRetry}>
            <RefreshCw className="mr-2 size-4" />
            Try Again
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/">
              <Home className="mr-2 size-4" />
              Go Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
