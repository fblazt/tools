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
        "size-[38px] rounded-none border border-[#e8e8e3] dark:border-[#282828] bg-[#fbfbf9] dark:bg-[#1d1d16] hover:bg-[#f4f4f0] dark:hover:bg-[#23231b] transition-colors flex items-center justify-center cursor-pointer relative",
        className
      )}
    >
      <Sun className="size-[18px] text-[#0069a8] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-[18px] text-[#00a6f4] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}