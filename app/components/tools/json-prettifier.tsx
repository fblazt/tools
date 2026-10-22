import * as React from "react";
import { useState, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import {
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  SAMPLE_JSON,
  validateAndFormatJson,
  buildJsonNodeTree,
  collectAllCollapsibleNodeIds,
  type JsonNode,
} from "~/lib/json-prettifier";

interface JsonTreeNodeViewProps {
  node: JsonNode;
  isLast: boolean;
  isParentArray: boolean;
  collapsedIds: Set<string>;
  onToggleCollapse: (id: string) => void;
  indent: 2 | 4;
}

function JsonTreeNodeView({
  node,
  isLast,
  isParentArray,
  collapsedIds,
  onToggleCollapse,
  indent,
}: JsonTreeNodeViewProps) {
  const basePadding = (node.depth - 1) * (indent === 2 ? 16 : 28);
  const hasChildren = (node.itemCount ?? 0) > 0;
  const isContainer = node.type === "object" || node.type === "array";

  if (!isContainer) {
    return (
      <div
        className="flex items-center min-h-[1.5rem] hover:bg-muted/30 transition-colors"
        style={{ paddingLeft: `${basePadding}px` }}
      >
        <span className="w-4 h-4 mr-1 inline-block shrink-0" aria-hidden="true" />
        {node.key !== undefined && !isParentArray && (
          <>
            <span className="text-sky-600 dark:text-sky-400 font-mono">"{node.key}"</span>
            <span className="text-muted-foreground mr-1">:</span>
          </>
        )}
        {node.type === "string" && (
          <span className="text-emerald-600 dark:text-emerald-400 font-mono">
            {JSON.stringify(node.value)}
          </span>
        )}
        {node.type === "number" && (
          <span className="text-amber-600 dark:text-amber-400 font-mono">
            {String(node.value)}
          </span>
        )}
        {node.type === "boolean" && (
          <span className="text-purple-600 dark:text-purple-400 font-mono">
            {String(node.value)}
          </span>
        )}
        {node.type === "null" && (
          <span className="text-rose-600 dark:text-rose-400 font-mono">null</span>
        )}
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  if (!hasChildren) {
    return (
      <div
        className="flex items-center min-h-[1.5rem] hover:bg-muted/30 transition-colors"
        style={{ paddingLeft: `${basePadding}px` }}
      >
        <span className="w-4 h-4 mr-1 inline-block shrink-0" aria-hidden="true" />
        {node.key !== undefined && !isParentArray && (
          <>
            <span className="text-sky-600 dark:text-sky-400 font-mono">"{node.key}"</span>
            <span className="text-muted-foreground mr-1">:</span>
          </>
        )}
        <span className="text-muted-foreground font-mono">
          {node.type === "object" ? "{}" : "[]"}
        </span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  const isCollapsed = collapsedIds.has(node.id);

  if (isCollapsed) {
    const count = node.itemCount ?? 0;
    const chipText =
      node.type === "object"
        ? `{ ... ${count} ${count === 1 ? "key" : "keys"} }`
        : `[ ... ${count} ${count === 1 ? "item" : "items"} ]`;

    return (
      <div
        className="flex items-center min-h-[1.5rem] hover:bg-muted/30 transition-colors"
        style={{ paddingLeft: `${basePadding}px` }}
      >
        <button
          type="button"
          onClick={() => onToggleCollapse(node.id)}
          aria-label={`Expand ${node.key ?? (node.type === "object" ? "object" : "array")}`}
          data-testid={`caret-${node.id}`}
          className="w-4 h-4 mr-1 inline-flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 select-none cursor-pointer"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
        {node.key !== undefined && !isParentArray && (
          <>
            <span className="text-sky-600 dark:text-sky-400 font-mono">"{node.key}"</span>
            <span className="text-muted-foreground mr-1">:</span>
          </>
        )}
        <button
          type="button"
          onClick={() => onToggleCollapse(node.id)}
          className="inline-flex items-center px-1.5 py-0.5 text-xs font-mono rounded-none bg-muted hover:bg-muted/80 text-muted-foreground border border-border cursor-pointer select-none"
          aria-label={`Unfold ${node.key ?? (node.type === "object" ? "object" : "array")}`}
        >
          {chipText}
        </button>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  return (
    <>
      <div
        className="flex items-center min-h-[1.5rem] hover:bg-muted/30 transition-colors"
        style={{ paddingLeft: `${basePadding}px` }}
      >
        <button
          type="button"
          onClick={() => onToggleCollapse(node.id)}
          aria-label={`Collapse ${node.key ?? (node.type === "object" ? "object" : "array")}`}
          data-testid={`caret-${node.id}`}
          className="w-4 h-4 mr-1 inline-flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 select-none cursor-pointer"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
        {node.key !== undefined && !isParentArray && (
          <>
            <span className="text-sky-600 dark:text-sky-400 font-mono">"{node.key}"</span>
            <span className="text-muted-foreground mr-1">:</span>
          </>
        )}
        <span className="text-muted-foreground font-mono">
          {node.type === "object" ? "{" : "["}
        </span>
      </div>

      {node.children?.map((child, index) => (
        <JsonTreeNodeView
          key={child.id}
          node={child}
          isLast={index === (node.children?.length ?? 0) - 1}
          isParentArray={node.type === "array"}
          collapsedIds={collapsedIds}
          onToggleCollapse={onToggleCollapse}
          indent={indent}
        />
      ))}

      <div
        className="flex items-center min-h-[1.5rem] hover:bg-muted/30 transition-colors"
        style={{ paddingLeft: `${basePadding}px` }}
      >
        <span className="w-4 h-4 mr-1 inline-block shrink-0" aria-hidden="true" />
        <span className="text-muted-foreground font-mono">
          {node.type === "object" ? "}" : "]"}
        </span>
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    </>
  );
}

export function JsonPrettifier(): React.JSX.Element {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const validation = useMemo(
    () => validateAndFormatJson(input, { indent }),
    [input, indent]
  );

  const parsedData = useMemo(() => {
    if (!validation.isValid) return null;
    try {
      return JSON.parse(input);
    } catch {
      return null;
    }
  }, [input, validation.isValid]);

  const treeRoot = useMemo(() => {
    if (parsedData === null) return null;
    return buildJsonNodeTree(parsedData);
  }, [parsedData]);

  const handleSample = () => {
    setInput(SAMPLE_JSON);
    setCollapsedIds(new Set());
  };

  const handleClear = () => {
    setInput("");
    setCollapsedIds(new Set());
  };

  const handleToggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleFoldAll = () => {
    if (!treeRoot) return;
    const allIds = collectAllCollapsibleNodeIds(treeRoot);
    setCollapsedIds(new Set(allIds));
  };

  const handleUnfoldAll = () => {
    setCollapsedIds(new Set());
  };

  const handleCopy = async () => {
    if (!validation.isValid || !validation.formatted) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(validation.formatted);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy JSON:", err);
    }
  };

  const handleSave = () => {
    if (!validation.isValid || !validation.formatted) return;
    const blob = new Blob([validation.formatted], { type: "application/json" });
    if (typeof URL.createObjectURL === "function") {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "formatted.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(url);
      }
    }
  };

  const isEmpty = !input.trim();

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Card (Input) */}
        <Card className="rounded-none border-border flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b border-border">
            <CardTitle className="text-base font-semibold">Input</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-none h-8 px-3 text-xs"
                onClick={handleSample}
              >
                Sample
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none h-8 px-3 text-xs"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JSON here..."
              className="font-mono text-sm leading-relaxed rounded-none min-h-[420px] flex-1 resize-y border-border"
            />
          </CardContent>
        </Card>

        {/* Right Card (Output) */}
        <Card className="rounded-none border-border flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2 space-y-0 p-4 border-b border-border">
            <CardTitle className="text-base font-semibold">Output</CardTitle>
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground mr-1">
                <span>Indent:</span>
                <Button
                  variant={indent === 2 ? "secondary" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-xs rounded-none"
                  onClick={() => setIndent(2)}
                >
                  2
                </Button>
                <Button
                  variant={indent === 4 ? "secondary" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-xs rounded-none"
                  onClick={() => setIndent(4)}
                >
                  4
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs rounded-none"
                onClick={handleFoldAll}
                disabled={!parsedData}
              >
                Fold All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs rounded-none"
                onClick={handleUnfoldAll}
                disabled={!parsedData}
              >
                Unfold
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs rounded-none"
                onClick={handleCopy}
                disabled={!validation.isValid}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs rounded-none"
                onClick={handleSave}
                disabled={!validation.isValid}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col">
            {isEmpty ? (
              <div className="flex items-center justify-center min-h-[420px] p-6 text-center text-muted-foreground font-mono text-sm">
                Enter or paste JSON on the left to inspect and format.
              </div>
            ) : !validation.isValid && validation.error ? (
              <div className="min-h-[420px]">
                <div className="rounded-none border border-destructive/50 bg-destructive/10 text-destructive text-sm font-mono p-3 space-y-1">
                  <div className="font-semibold">Syntax Error:</div>
                  <div>{validation.error.message}</div>
                  {validation.error.line !== undefined && (
                    <div className="text-xs text-destructive/80">
                      Line {validation.error.line}, Column {validation.error.column}
                    </div>
                  )}
                </div>
              </div>
            ) : treeRoot ? (
              <div
                data-testid="json-tree-view"
                className="p-4 min-h-[420px] flex-1 font-mono text-sm leading-relaxed overflow-x-auto bg-muted/10 border border-border"
              >
                <JsonTreeNodeView
                  node={treeRoot}
                  isLast={true}
                  isParentArray={false}
                  collapsedIds={collapsedIds}
                  onToggleCollapse={handleToggleCollapse}
                  indent={indent}
                />
              </div>
            ) : null}
          </CardContent>

          {validation.isValid && validation.stats && (
            <div className="border-t border-border p-3 font-mono text-xs flex flex-wrap gap-4 text-muted-foreground">
              <span>Raw: {validation.stats.rawBytes} B</span>
              <span>Formatted: {validation.stats.formattedBytes} B</span>
              <span>Minified: {validation.stats.minifiedBytes} B</span>
              <span>Lines: {validation.stats.lineCount}</span>
              <span>Depth: {validation.stats.depth}</span>
              <span>Keys: {validation.stats.keyCount}</span>
              <span>Saved: {validation.stats.reductionPercentage}%</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
