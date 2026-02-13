import { createFileRoute } from "@tanstack/react-router";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_public/offline")({
  component: OfflinePage,
});

function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <WifiOff className="size-10 text-muted-foreground" />
      </div>

      <h1 className="mt-8 text-3xl font-bold tracking-tight">
        You're offline
      </h1>

      <p className="mt-4 max-w-md text-muted-foreground">
        It looks like you've lost your internet connection. Check your connection
        and try again.
      </p>

      <Button
        size="lg"
        className="mt-8"
        onClick={() => {
          window.location.reload();
        }}
      >
        <RefreshCw className="mr-2 size-4" />
        Try again
      </Button>
    </div>
  );
}
