import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const DISMISS_KEY = "apostle-pwa-install-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Shows a subtle install banner when the browser fires `beforeinstallprompt`.
 * The user can dismiss the banner and it will not reappear for 7 days.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if previously dismissed
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - Number.parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION_MS) {
        return; // Still within dismiss window
      }
      localStorage.removeItem(DISMISS_KEY);
    }

    // Check if already installed (display-mode: standalone)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    function handleBeforeInstall(e: Event) {
      // Prevent the default mini-infobar
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setVisible(false);
    }

    // Clear the prompt reference regardless of outcome
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 md:left-auto md:right-4">
      <div className="flex items-center gap-3 rounded-lg border bg-background p-4 shadow-lg">
        <div className="flex-1">
          <p className="text-sm font-medium">Install Apostle</p>
          <p className="text-xs text-muted-foreground">
            Add to your home screen for the best experience.
          </p>
        </div>
        <Button size="sm" onClick={handleInstall}>
          Install
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss install prompt"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
