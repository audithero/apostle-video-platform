import { useState, useEffect } from "react";
import type { SDUIScreen } from "@platform/sdui-schema";
import { SDUIRenderer } from "./renderer/SDUIRenderer";
import { ThemeProvider } from "./renderer/ThemeProvider";
import { ActionProvider } from "./renderer/ActionHandler";
import { sampleScreen } from "./pages/sample-screen";

export function App() {
  const [screen, setScreen] = useState<SDUIScreen | null>(null);

  useEffect(() => {
    // In production, this would fetch from the SDUI render.resolve tRPC endpoint
    // For now, use sample data for development
    setScreen(sampleScreen);
  }, []);

  if (!screen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg text-gray-500">Loading...</div>
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
