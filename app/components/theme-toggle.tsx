import { Moon, Sun } from "lucide-react"
import { useTheme } from "~/components/theme-provider"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "size-9.5 rounded-none border border-border bg-sidebar hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors",
        className
      )}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}