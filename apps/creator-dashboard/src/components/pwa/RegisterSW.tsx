import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Registers the service worker in production and handles update notifications.
 * Renders nothing visible -- all user feedback is via toast notifications.
 */
export function RegisterSW() {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Only register in production
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      import.meta.env.DEV
    ) {
      return;
    }

    let cancelled = false;

    async function register() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (cancelled) return;
        registrationRef.current = registration;

        // Check for updates periodically (every 60 minutes)
        const intervalId = setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000,
        );

        // Listen for new service worker becoming available
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New content is available, show update toast
              toast("Update available", {
                description:
                  "A new version of Apostle is available. Refresh to update.",
                action: {
                  label: "Refresh",
                  onClick: () => {
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                    window.location.reload();
                  },
                },
                duration: Number.POSITIVE_INFINITY,
              });
            }
          });
        });

        // Handle controller change (new SW activated)
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });

        return () => {
          clearInterval(intervalId);
        };
      } catch (error) {
        console.error("[RegisterSW] Service worker registration failed:", error);
      }
    }

    register();

    return () => {
      cancelled = true;
    };
  }, []);

  // This component renders nothing
  return null;
}
