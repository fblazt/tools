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
import { Search, ExternalLink } from "lucide-react";
import { tools, type ToolDefinition } from "~/lib/tools-registry";
import { cn } from "~/lib/utils";

export interface ToolsSearchProps {
  showTrigger?: boolean;
}

export function openToolsSearch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-tools-search"));
  }
}

export function SearchButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      openToolsSearch();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Search tools (⌘K)"
      className={cn(
        "h-[38px] min-w-[148px] px-3.5 py-2 border border-[#e8e8e3] dark:border-[#282828] bg-[#fbfbf9] dark:bg-[#1d1d16] hover:bg-[#f4f4f0] dark:hover:bg-[#23231b] transition-colors flex items-center justify-between gap-2.5 cursor-pointer rounded-none text-foreground select-none",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Search className="size-4 text-[#7c7c67] dark:text-[#abab9c]" />
        <span className="font-mono text-[12.5px] font-medium text-[#0c0c09] dark:text-[#fbfbf9]">
          Search
        </span>
      </div>
      <kbd className="bg-[#f4f4f0] dark:bg-[#2b2b22] border border-[#e8e8e3] dark:border-[#282828] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#0c0c09] dark:text-[#fbfbf9] rounded-none">
        ⌘K
      </kbd>
    </button>
  );
}

export function ToolsSearch({ showTrigger = true }: ToolsSearchProps = {}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Listen for custom open event
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-tools-search", handleOpen);
    return () => window.removeEventListener("open-tools-search", handleOpen);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "/") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        setOpen((prev) => !prev);
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
        <SearchButton onClick={() => setOpen(true)} />
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search Tools"
        description="Search tools or commands..."
        className="max-w-[600px] rounded-none bg-[#fbfbf9] dark:bg-[#1d1d16] border border-[#e8e8e3] dark:border-[#282828] p-0 overflow-hidden shadow-2xl"
      >
        <div className="relative border-b border-[#e8e8e3] dark:border-[#282828] [&_[cmdk-input-wrapper]]:border-b-0 [&_svg]:text-[#0069a8] dark:[&_svg]:text-[#00a6f4] [&_svg]:opacity-100">
          <CommandInput
            placeholder="Search tools or commands..."
            value={search}
            onValueChange={setSearch}
            className="font-mono text-sm pr-16"
          />
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-[#f4f4f0] dark:bg-[#2b2b22] border border-[#e8e8e3] dark:border-[#282828] text-[#7c7c67] dark:text-[#abab9c] text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded-none pointer-events-none select-none">
            ESC
          </kbd>
        </div>
        <CommandList className="font-sans max-h-[360px] overflow-y-auto p-1.5">
          <CommandEmpty className="py-8 text-center text-sm font-mono text-[#7c7c67] dark:text-[#abab9c]">
            No tools found.
          </CommandEmpty>
          {Object.entries(groupedTools).map(([category, categoryTools]) => (
            <CommandGroup
              key={category}
              heading={category}
              className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#0069a8] dark:[&_[cmdk-group-heading]]:text-[#00a6f4] [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5"
            >
              {categoryTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <CommandItem
                    key={tool.id}
                    value={`${tool.title} ${tool.category} ${tool.description} ${tool.keywords.join(" ")}`}
                    onSelect={() => handleToolSelect(tool)}
                    className="group/item p-2.5 rounded-none border border-transparent data-[selected=true]:border-[#0069a8] dark:data-[selected=true]:border-[#00a6f4] data-[selected=true]:bg-[#f4f4f0] dark:data-[selected=true]:bg-[#2b2b22] flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="size-[38px] flex items-center justify-center shrink-0 bg-[#f4f4f0] dark:bg-[#2b2b22] border border-[#e8e8e3] dark:border-[#282828] rounded-none">
                        <Icon className="size-4 text-[#0069a8] dark:text-[#00a6f4] shrink-0" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-semibold text-sm text-[#0c0c09] dark:text-[#fbfbf9] truncate">
                            {tool.title}
                          </span>
                          <span className="font-mono text-[10.5px] text-[#0069a8] dark:text-[#00a6f4] shrink-0">
                            [{tool.category}]
                          </span>
                          {tool.externalUrl && (
                            <ExternalLink className="size-3 text-[#7c7c67] dark:text-[#abab9c] shrink-0" />
                          )}
                        </div>
                        <span className="font-mono text-xs text-[#7c7c67] dark:text-[#abab9c] truncate">
                          {tool.description}
                        </span>
                      </div>
                    </div>
                    <span className="hidden group-data-[selected=true]/item:flex group-aria-selected/item:flex items-center text-[11px] font-mono font-semibold text-[#0069a8] dark:text-[#00a6f4] bg-[#fbfbf9] dark:bg-[#1d1d16] border border-[#e8e8e3] dark:border-[#282828] px-2 py-0.5 rounded-none shrink-0">
                      ↵ Open
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
        <div className="bg-[#f4f4f0] dark:bg-[#13130e] border-t border-[#e8e8e3] dark:border-[#282828] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#7c7c67] dark:text-[#abab9c]">
            <span>
              <kbd className="bg-background border border-border px-1 py-0.5 mr-1 font-semibold text-foreground">↑↓</kbd>
              navigate
            </span>
            <span>
              <kbd className="bg-background border border-border px-1 py-0.5 mr-1 font-semibold text-foreground">↵</kbd>
              select
            </span>
          </div>
          <span className="font-mono text-[11px] font-medium text-[#0069a8] dark:text-[#00a6f4]">
            Privacy-First Client Tools
          </span>
        </div>
      </CommandDialog>
    </>
  );
}
