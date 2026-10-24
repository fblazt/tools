import * as React from "react";
import { useState, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import {
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Trash2,
  Clipboard,
  FoldVertical,
  UnfoldVertical,
} from "lucide-react";
import {
  SAMPLE_JSON,
  validateAndFormatJson,
  buildJsonNodeTree,
  collectAllCollapsibleNodeIds,
  type JsonNode,
  type JsonNodeType,
} from "~/lib/json-prettifier";

interface VisibleLine {
  id: string;
  nodeId?: string;
  key?: string;
  isParentArray?: boolean;
  nodeType: JsonNodeType;
  value?: unknown;
  itemCount?: number;
  depth: number;
  isLast: boolean;
  kind: "open" | "close" | "leaf" | "empty-container" | "collapsed";
  collapsible: boolean;
  isCollapsed?: boolean;
}

function flattenJsonTree(
  node: JsonNode,
  collapsedIds: Set<string>,
  isLast: boolean = true,
  isParentArray: boolean = false
): VisibleLine[] {
  const isContainer = node.type === "object" || node.type === "array";
  const hasChildren = (node.itemCount ?? 0) > 0;
  const isCollapsed = collapsedIds.has(node.id);

  if (!isContainer) {
    return [
      {
        id: node.id,
        nodeId: node.id,
        key: node.key,
        isParentArray,
        nodeType: node.type,
        value: node.value,
        depth: node.depth,
        isLast,
        kind: "leaf",
        collapsible: false,
      },
    ];
  }

  if (!hasChildren) {
    return [
      {
        id: node.id,
        nodeId: node.id,
        key: node.key,
        isParentArray,
        nodeType: node.type,
        depth: node.depth,
        isLast,
        kind: "empty-container",
        collapsible: false,
      },
    ];
  }

  if (isCollapsed) {
    return [
      {
        id: `${node.id}-collapsed`,
        nodeId: node.id,
        key: node.key,
        isParentArray,
        nodeType: node.type,
        itemCount: node.itemCount,
        depth: node.depth,
        isLast,
        kind: "collapsed",
        collapsible: true,
        isCollapsed: true,
      },
    ];
  }

  const lines: VisibleLine[] = [
    {
      id: `${node.id}-open`,
      nodeId: node.id,
      key: node.key,
      isParentArray,
      nodeType: node.type,
      depth: node.depth,
      isLast,
      kind: "open",
      collapsible: true,
      isCollapsed: false,
    },
  ];

  if (node.children) {
    const total = node.children.length;
    node.children.forEach((child, index) => {
      const childLines = flattenJsonTree(
        child,
        collapsedIds,
        index === total - 1,
        node.type === "array"
      );
      lines.push(...childLines);
    });
  }

  lines.push({
    id: `${node.id}-close`,
    nodeId: node.id,
    nodeType: node.type,
    depth: node.depth,
    isLast,
    kind: "close",
    collapsible: false,
  });

  return lines;
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

  const visibleLines = useMemo(() => {
    if (!treeRoot) return [];
    return flattenJsonTree(treeRoot, collapsedIds);
  }, [treeRoot, collapsedIds]);

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

  const handlePaste = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        setInput(text);
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
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
  const inputLines = input.length > 0 ? input.split("\n").length : 0;
  const inputChars = input.length;
  const inputBytes = new TextEncoder().encode(input).length;

  const stats = validation.stats ?? {
    rawBytes: 0,
    formattedBytes: 0,
    minifiedBytes: 0,
    lineCount: 0,
    depth: 0,
    keyCount: 0,
    reductionPercentage: 0,
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. Global Top Toolbar */}
      <div
        data-testid="prettifier-toolbar"
        className="rounded-none border border-border bg-card p-2.5 px-4 flex items-center justify-between flex-wrap gap-2"
      >
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono text-muted-foreground mr-1">Indent:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIndent(2)}
            className={cn(
              "h-7 w-8 p-0 text-xs font-mono rounded-none",
              indent === 2
                ? "bg-sky-600 hover:bg-sky-500 text-white font-mono border-sky-600 hover:text-white"
                : "bg-background text-muted-foreground"
            )}
          >
            2
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIndent(4)}
            className={cn(
              "h-7 w-8 p-0 text-xs font-mono rounded-none",
              indent === 4
                ? "bg-sky-600 hover:bg-sky-500 text-white font-mono border-sky-600 hover:text-white"
                : "bg-background text-muted-foreground"
            )}
          >
            4
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none h-7 px-3 text-xs font-mono"
            onClick={handleSample}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-sky-400" />
            Sample
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none h-7 px-3 text-xs font-mono"
            onClick={handleClear}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* 2. Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column: Input Card */}
        <Card className="rounded-none border-border flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold font-mono">Input</CardTitle>
              {!isEmpty && validation.isValid && (
                <span
                  data-testid="input-status-badge"
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono border border-sky-500/60 bg-sky-950/40 text-sky-400 rounded-none"
                >
                  <Check className="h-3 w-3" /> Valid JSON
                </span>
              )}
              {!isEmpty && !validation.isValid && (
                <span
                  data-testid="input-status-badge"
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono border border-destructive/60 bg-destructive/20 text-destructive rounded-none"
                >
                  ✕ Invalid JSON
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JSON here..."
              className="font-mono text-xs md:text-sm leading-relaxed rounded-none min-h-[460px] flex-1 resize-none border-0 p-4 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
            />
          </CardContent>
          <div
            data-testid="input-footer"
            className="border-t border-border px-4 py-2 flex items-center justify-between text-xs font-mono text-muted-foreground bg-muted/20"
          >
            <div data-testid="input-footer-stats">
              Lines: {inputLines} &nbsp; Chars: {inputChars} &nbsp; {inputBytes} B
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePaste}
              className="rounded-none h-7 px-2.5 text-xs font-mono"
            >
              <Clipboard className="h-3.5 w-3.5 mr-1.5" />
              Paste
            </Button>
          </div>
        </Card>

        {/* Right Column: Output Card */}
        <Card className="rounded-none border-border flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2 space-y-0 p-4 border-b border-border">
            <CardTitle className="text-sm font-semibold font-mono">Output</CardTitle>
            <div className="flex items-center flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleCopy}
                disabled={!validation.isValid}
                className="rounded-none h-7 px-3 text-xs font-mono bg-sky-600 hover:bg-sky-500 text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!validation.isValid}
                className="rounded-none h-7 px-2.5 text-xs font-mono"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFoldAll}
                disabled={!parsedData}
                className="rounded-none h-7 px-2.5 text-xs font-mono"
              >
                <FoldVertical className="h-3.5 w-3.5 mr-1.5" />
                Fold All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUnfoldAll}
                disabled={!parsedData}
                className="rounded-none h-7 px-2.5 text-xs font-mono"
              >
                <UnfoldVertical className="h-3.5 w-3.5 mr-1.5" />
                Unfold
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {isEmpty ? (
              <div className="flex items-center justify-center min-h-[460px] p-6 text-center text-muted-foreground font-mono text-xs md:text-sm">
                Enter or paste JSON on the left to inspect and format.
              </div>
            ) : !validation.isValid && validation.error ? (
              <div className="p-4 min-h-[460px]">
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
                className="flex flex-row min-h-[460px] flex-1 font-mono text-xs md:text-sm leading-6 overflow-x-auto bg-muted/10 border-0"
              >
                {/* Gutter */}
                <div
                  data-testid="line-gutter"
                  className="w-12 shrink-0 border-r border-border/40 select-none py-3 text-muted-foreground font-mono text-xs text-right pr-2 space-y-0 sticky left-0 bg-card/90 backdrop-blur z-10"
                >
                  {visibleLines.map((line, idx) => (
                    <div key={line.id} className="h-6 flex items-center justify-end gap-1">
                      <span className="text-muted-foreground/60 select-none">{idx + 1}</span>
                      {line.collapsible ? (
                        <button
                          type="button"
                          data-testid={`caret-${line.nodeId}`}
                          aria-label={`${line.isCollapsed ? "Expand" : "Collapse"} ${line.key ?? (line.nodeType === "object" ? "object" : "array")}`}
                          onClick={() => handleToggleCollapse(line.nodeId!)}
                          className="inline-flex items-center justify-center w-3.5 h-3.5 cursor-pointer select-none"
                        >
                          {line.isCollapsed ? (
                            <ChevronRight className="h-3 w-3 text-sky-400 cursor-pointer hover:text-sky-300" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-sky-400/80 cursor-pointer hover:text-sky-300" />
                          )}
                        </button>
                      ) : (
                        <span className="w-3.5 inline-block" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Code Area */}
                <div className="py-3 px-3 flex-1 space-y-0 overflow-x-auto">
                  {visibleLines.map((line) => {
                    const basePadding = (line.depth - 1) * (indent === 2 ? 16 : 28);
                    return (
                      <div
                        key={line.id}
                        className="h-6 flex items-center whitespace-pre hover:bg-muted/30 transition-colors"
                        style={{ paddingLeft: `${basePadding}px` }}
                      >
                        {line.key !== undefined && !line.isParentArray && (
                          <>
                            <span className="text-sky-600 dark:text-sky-400 font-mono">
                              "{line.key}"
                            </span>
                            <span className="text-muted-foreground mr-1">:</span>
                          </>
                        )}

                        {line.kind === "open" && (
                          <span className="text-muted-foreground font-mono">
                            {line.nodeType === "object" ? "{" : "["}
                          </span>
                        )}

                        {line.kind === "close" && (
                          <>
                            <span className="text-muted-foreground font-mono">
                              {line.nodeType === "object" ? "}" : "]"}
                            </span>
                            {!line.isLast && <span className="text-muted-foreground">,</span>}
                          </>
                        )}

                        {line.kind === "empty-container" && (
                          <>
                            <span className="text-muted-foreground font-mono">
                              {line.nodeType === "object" ? "{}" : "[]"}
                            </span>
                            {!line.isLast && <span className="text-muted-foreground">,</span>}
                          </>
                        )}

                        {line.kind === "collapsed" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleCollapse(line.nodeId!)}
                              aria-label={`Unfold ${line.key ?? (line.nodeType === "object" ? "object" : "array")}`}
                              className="inline-flex items-center px-1.5 py-0.5 text-xs font-mono rounded-none border border-sky-500/60 bg-sky-950/40 text-sky-300 hover:bg-sky-900/50 cursor-pointer select-none"
                            >
                              {line.nodeType === "object"
                                ? `{ ... ${line.itemCount ?? 0} ${(line.itemCount ?? 0) === 1 ? "key" : "keys"} }`
                                : `[ ... ${line.itemCount ?? 0} ${(line.itemCount ?? 0) === 1 ? "item" : "items"} ]`}
                            </button>
                            {!line.isLast && <span className="text-muted-foreground">,</span>}
                          </>
                        )}

                        {line.kind === "leaf" && (
                          <>
                            {line.nodeType === "string" && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                                {JSON.stringify(line.value)}
                              </span>
                            )}
                            {line.nodeType === "number" && (
                              <span className="text-amber-600 dark:text-amber-400 font-mono">
                                {String(line.value)}
                              </span>
                            )}
                            {line.nodeType === "boolean" && (
                              <span className="text-purple-600 dark:text-purple-400 font-mono">
                                {String(line.value)}
                              </span>
                            )}
                            {line.nodeType === "null" && (
                              <span className="text-rose-600 dark:text-rose-400 font-mono">
                                null
                              </span>
                            )}
                            {!line.isLast && <span className="text-muted-foreground">,</span>}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </CardContent>

          <div
            data-testid="output-footer"
            className="border-t border-border px-4 py-2 flex items-center justify-between text-xs font-mono bg-muted/20"
          >
            <div data-testid="output-stats-left" className="flex items-center gap-3">
              <span className="text-sky-400 font-medium">Formatted: {stats.formattedBytes} B</span>
              <span className="text-muted-foreground">Lines: {stats.lineCount}</span>
              <span className="text-muted-foreground">Depth: {stats.depth}</span>
              <span className="text-muted-foreground">Keys: {stats.keyCount}</span>
            </div>
            <div data-testid="output-stats-right" className="text-muted-foreground">
              Minified: {stats.minifiedBytes} B (-{stats.reductionPercentage}%)
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
