import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Search, Command as CommandIcon, ExternalLink } from "lucide-react";
import { tools, type ToolDefinition } from "~/lib/tools-registry";

export interface ToolsSearchProps {
  showTrigger?: boolean;
}

export function ToolsSearch({ showTrigger = true }: ToolsSearchProps = {}) {
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

  const handleToolSelect = (tool: ToolDefinition) => {
    if (tool.externalUrl) {
      window.open(tool.externalUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(`/tools/${tool.id}`);
    }
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
      {showTrigger && (
        <button
          className="flex items-center gap-2 px-3 py-2 text-sm bg-muted/60 hover:bg-muted text-foreground rounded-none border border-border transition-colors font-mono"
          aria-label="Search tools (⌘K or /)"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground font-sans">Search tools...</span>
          <span className="ml-auto flex items-center gap-1">
            <kbd className="flex items-center gap-1 text-[10px] font-mono bg-background border border-border rounded-none px-1.5 py-0.5">
              <CommandIcon className="h-3 w-3" />
              <span>K</span>
            </kbd>
            <kbd className="text-[10px] font-mono bg-background border border-border rounded-none px-1.5 py-0.5">
              /
            </kbd>
          </span>
        </button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search Tools"
        description="Type a command or search for a tool..."
        className="rounded-none border-border"
      >
        <CommandInput
          placeholder="Search tools..."
          value={search}
          onValueChange={setSearch}
          className="font-mono text-sm"
        />
        <CommandList className="font-sans">
          <CommandEmpty className="py-6 text-center text-sm font-mono text-muted-foreground">
            No tools found.
          </CommandEmpty>
          {Object.entries(groupedTools).map(([category, categoryTools]) => (
            <CommandGroup key={category} heading={category} className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:tracking-wider">
              {categoryTools.map((tool) => (
                <CommandItem
                  key={tool.id}
                  onSelect={() => handleToolSelect(tool)}
                  className="flex flex-col items-start p-3 rounded-none cursor-pointer"
                >
                  <div className="font-medium flex items-center gap-1.5 w-full">
                    <span>{tool.title}</span>
                    {tool.externalUrl && (
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                    )}
                  </div>
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
