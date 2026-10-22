import { Moon, Sun } from "lucide-react";
import { useTheme } from "~/components/theme-provider";
import { cn } from "~/lib/utils";

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
      className={cn(
        "size-[38px] rounded-none border border-border bg-sidebar hover:bg-muted transition-colors flex items-center justify-center cursor-pointer relative",
        className
      )}
    >
      <Sun className="size-[18px] text-primary rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-[18px] text-primary rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}