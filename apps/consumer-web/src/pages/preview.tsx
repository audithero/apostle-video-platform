import { useState, useEffect } from "react";
import type { SDUIScreen } from "@platform/sdui-schema";
import { SDUIRenderer } from "../renderer/SDUIRenderer";
import { ThemeProvider } from "../renderer/ThemeProvider";
import { ActionProvider } from "../renderer/ActionHandler";

/**
 * Preview page — renders SDUI templates received via postMessage.
 *
 * The creator dashboard embeds this page in an iframe and sends
 * the SDUIScreen JSON via window.postMessage. Navigation actions
 * are stripped so creators can browse the preview without leaving.
 */
export function PreviewPage() {
  const [screen, setScreen] = useState<SDUIScreen | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Accept messages with a valid SDUI screen payload
      if (event.data?.type === "sdui-preview" && event.data.screen) {
        setScreen(event.data.screen as SDUIScreen);
      }
    }

    window.addEventListener("message", handleMessage);

    // Signal to parent that the iframe is ready to receive data
    window.parent.postMessage({ type: "sdui-preview-ready" }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!screen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
          <p className="text-sm text-gray-400">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ActionProvider>
        <SDUIRenderer screen={screen} />
      </ActionProvider>
    </ThemeProvider>
  );
}
