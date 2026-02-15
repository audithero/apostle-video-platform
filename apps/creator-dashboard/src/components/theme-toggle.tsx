import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Full dropdown toggle for header areas — Light / Dark / System.
 */
export function ModeToggle({ className }: { readonly className?: string }) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-8 rounded-full border border-border/60 transition-all duration-200 hover:border-foreground/40 hover:bg-foreground/5",
            className,
          )}
        >
          <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] rounded-xl border-border/60 p-1">
        <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-lg gap-2 cursor-pointer">
          <Sun className="size-3.5" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-lg gap-2 cursor-pointer">
          <Moon className="size-3.5" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-lg gap-2 cursor-pointer">
          <Monitor className="size-3.5" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact inline toggle for sidebars — cycles through light → dark → system.
 */
export function CompactThemeToggle({ className }: { readonly className?: string }) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const label = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      {theme === "light" && <Sun className="size-[18px] shrink-0" />}
      {theme === "dark" && <Moon className="size-[18px] shrink-0" />}
      {theme !== "light" && theme !== "dark" && <Monitor className="size-[18px] shrink-0" />}
      {label}
    </button>
  );
}
