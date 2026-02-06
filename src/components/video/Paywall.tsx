import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function Paywall() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-background/90 p-8 shadow-lg">
        <Lock className="size-10 text-muted-foreground" />
        <h2 className="text-xl font-bold">Subscribe to Watch</h2>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          This video is available exclusively to subscribers. Get access to all
          videos with a subscription.
        </p>
        <Button asChild size="lg">
          <Link to="/pricing">View Plans</Link>
        </Button>
      </div>
    </div>
  );
}
