import { createContext, useContext, useCallback, useMemo } from "react";
import type { SDUIAction } from "@platform/sdui-schema";

/* ------------------------------------------------------------------ */
/*  URL safety helpers                                                  */
/* ------------------------------------------------------------------ */

/** Only allow http/https URLs to prevent javascript: and data: XSS */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, globalThis.location?.origin ?? "https://localhost");
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Only allow API calls to the platform's own domains */
const ALLOWED_API_HOSTS = [
  globalThis.location?.hostname,
  "api.apostle.com",
].filter(Boolean) as string[];

function isAllowedEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint, globalThis.location?.origin ?? "https://localhost");
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return ALLOWED_API_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */

interface ActionContextValue {
  handleAction: (action: SDUIAction) => void;
}

const ActionContext = createContext<ActionContextValue>({
  handleAction: () => {},
});

export function useAction() {
  return useContext(ActionContext);
}

interface ActionProviderProps {
  onNavigate?: (to: string, params?: Record<string, string>) => void;
  onTrackEvent?: (name: string, properties?: Record<string, unknown>) => void;
  children: React.ReactNode;
}

export function ActionProvider({
  onNavigate,
  onTrackEvent,
  children,
}: ActionProviderProps) {
  const handleAction = useCallback(
    (action: SDUIAction) => {
      switch (action.type) {
        case "navigate": {
          if (onNavigate) {
            onNavigate(action.to, action.params);
          } else if (isSafeUrl(action.to)) {
            window.location.href = action.to;
          } else {
            console.warn("[SDUI] Blocked unsafe navigate URL:", action.to);
          }
          break;
        }
        case "deepLink": {
          if (!isSafeUrl(action.url)) {
            console.warn("[SDUI] Blocked unsafe deepLink URL:", action.url);
            if (action.fallback && isSafeUrl(action.fallback)) {
              window.location.href = action.fallback;
            }
            break;
          }
          try {
            window.location.href = action.url;
          } catch {
            if (action.fallback && isSafeUrl(action.fallback)) {
              window.location.href = action.fallback;
            }
          }
          break;
        }
        case "apiCall": {
          if (!isAllowedEndpoint(action.endpoint)) {
            console.error("[SDUI] Blocked unauthorized API endpoint:", action.endpoint);
            if (action.onError) handleAction(action.onError);
            break;
          }
          fetch(action.endpoint, {
            method: action.method,
            headers: { "Content-Type": "application/json" },
            body: action.body ? JSON.stringify(action.body) : undefined,
          })
            .then((res) => {
              if (res.ok && action.onSuccess) {
                handleAction(action.onSuccess);
              } else if (!res.ok && action.onError) {
                handleAction(action.onError);
              }
            })
            .catch(() => {
              if (action.onError) {
                handleAction(action.onError);
              }
            });
          break;
        }
        case "openUrl": {
          if (!isSafeUrl(action.url)) {
            console.warn("[SDUI] Blocked unsafe openUrl:", action.url);
            break;
          }
          if (action.external) {
            window.open(action.url, "_blank", "noopener,noreferrer");
          } else {
            window.location.href = action.url;
          }
          break;
        }
        case "showModal": {
          // Modal rendering is handled by a higher-level component
          // This dispatches a custom event that the modal container listens to
          window.dispatchEvent(
            new CustomEvent("sdui:showModal", {
              detail: { screen: action.screen },
            }),
          );
          break;
        }
        case "dismissModal": {
          window.dispatchEvent(new CustomEvent("sdui:dismissModal"));
          break;
        }
        case "submitForm": {
          if (!isAllowedEndpoint(action.endpoint)) {
            console.error("[SDUI] Blocked unauthorized form endpoint:", action.endpoint);
            break;
          }
          const form = document.getElementById(action.formId);
          if (form instanceof HTMLFormElement) {
            const formData = new FormData(form);
            fetch(action.endpoint, {
              method: "POST",
              body: formData,
            });
          }
          break;
        }
        case "trackEvent": {
          if (onTrackEvent) {
            onTrackEvent(action.name, action.properties);
          }
          break;
        }
        case "playVideo": {
          window.dispatchEvent(
            new CustomEvent("sdui:playVideo", {
              detail: {
                videoUrl: action.videoUrl,
                autoplay: action.autoplay,
              },
            }),
          );
          break;
        }
        case "toggleState": {
          window.dispatchEvent(
            new CustomEvent("sdui:toggleState", {
              detail: { key: action.key, value: action.value },
            }),
          );
          break;
        }
      }
    },
    [onNavigate, onTrackEvent],
  );

  const value = useMemo(() => ({ handleAction }), [handleAction]);

  return (
    <ActionContext.Provider value={value}>{children}</ActionContext.Provider>
  );
}
