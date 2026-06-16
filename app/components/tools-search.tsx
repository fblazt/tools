import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Search, Command as CommandIcon } from "lucide-react";
import { tools } from "~/lib/tools-registry";

export function ToolsSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "/") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleToolSelect = (toolId: string) => {
    navigate(`/tools/${toolId}`);
    setOpen(false);
  };

  const filteredTools = tools.filter(
    (tool) =>
      !search ||
      tool.title.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase()) ||
      tool.category.toLowerCase().includes(search.toLowerCase()) ||
      tool.keywords.some((keyword) => keyword.includes(search.toLowerCase()))
  );

  // Group tools by category
  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <>
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
        aria-label="Search tools (⌘K or /)"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-muted-foreground">Search tools...</span>
        <span className="ml-auto flex items-center gap-1">
          <kbd className="flex items-center gap-1 text-xs bg-background border rounded px-1.5 py-0.5">
            <CommandIcon className="h-3 w-3" />
            <span>K</span>
          </kbd>
          <kbd className="text-xs bg-background border rounded px-1.5 py-0.5">
            /
          </kbd>
        </span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search Tools" description="Search for a tool to use...">
        <CommandInput
          placeholder="Search tools..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No tools found.</CommandEmpty>
          {Object.entries(groupedTools).map(([category, categoryTools]) => (
            <CommandGroup key={category} heading={category}>
              {categoryTools.map((tool) => (
                <CommandItem
                  key={tool.id}
                  onSelect={() => handleToolSelect(tool.id)}
                  className="flex flex-col items-start p-3"
                >
                  <div className="font-medium">{tool.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {tool.description}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
