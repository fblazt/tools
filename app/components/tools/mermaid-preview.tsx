import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  Download,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useTheme } from "~/components/theme-provider";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Textarea } from "~/components/ui/textarea";
import {
  MERMAID_PRESETS,
  computeMermaidStats,
  findMatchingPreset,
  getMermaidPreset,
  getMermaidThemeBackground,
  rasterizeSvgToPngBlob,
  renderMermaidDiagram,
  type MermaidPresetId,
  type MermaidRenderResult,
} from "~/lib/mermaid-preview";
import { cn } from "~/lib/utils";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;
const RENDER_DEBOUNCE_MS = 120;
const DRAFT_STORAGE_KEY = "fblazt-mermaid-preview-draft";

interface PanOffset {
  x: number;
  y: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originPan: PanOffset;
}

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));
}

function stepZoom(currentZoom: number, direction: 1 | -1): number {
  const step =
    direction === 1
      ? currentZoom < 2
        ? 0.25
        : currentZoom < 4
          ? 0.5
          : 1
      : currentZoom <= 2
        ? 0.25
        : currentZoom <= 4
          ? 0.5
          : 1;
  return clampZoom(currentZoom + direction * step);
}

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return true;
  }
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  return typeof mq?.matches === "boolean" ? mq.matches : true;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  if (typeof URL.createObjectURL !== "function") return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (typeof URL.revokeObjectURL === "function") {
    URL.revokeObjectURL(url);
  }
}

export function MermaidPreview(): React.JSX.Element {
  const { theme } = useTheme();
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(getSystemPrefersDark);

  useEffect(() => {
    if (theme !== "system") return;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      setSystemPrefersDark(true);
      return;
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (!mq || typeof mq.matches !== "boolean") {
      setSystemPrefersDark(true);
      return;
    }

    setSystemPrefersDark(mq.matches);
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handleChange);
      return () => mq.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const isDark = theme === "dark" ? true : theme === "light" ? false : systemPrefersDark;

  const initialPreset = MERMAID_PRESETS[0];
  const [source, setSource] = useState<string>(initialPreset.code);
  const [undoSource, setUndoSource] = useState<string | null>(null);
  const [renderResult, setRenderResult] = useState<MermaidRenderResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<PanOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const gutterRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const requestIdRef = useRef(0);
  const renderCounterRef = useRef(0);
  const hasMountedRef = useRef(false);
  const hasHydratedDraftRef = useRef(false);
  const isMountedRef = useRef(true);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const savedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft !== null && savedDraft.trim().length > 0) {
          setSource(savedDraft);
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedDraftRef.current) {
      hasHydratedDraftRef.current = true;
      return;
    }
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      if (source.trim().length === 0 || source.trim() === initialPreset.code.trim()) {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      } else {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, source);
      }
    } catch {
      // Ignore storage access errors
    }
  }, [source, initialPreset.code]);

  const liveStats = useMemo(() => computeMermaidStats(source), [source]);
  const matchingPreset = useMemo(() => findMatchingPreset(source), [source]);
  const isEmpty = source.trim().length === 0;

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    if (!source.trim()) {
      setRenderResult(null);
      return;
    }

    const executeRender = async () => {
      const renderId = `mermaid-preview-${++renderCounterRef.current}`;
      const result = await renderMermaidDiagram(renderId, source, isDark);
      if (!isMountedRef.current || requestIdRef.current !== currentRequestId) {
        return;
      }
      setRenderResult(result);
    };

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      void executeRender();
      return;
    }

    const timerId = setTimeout(() => {
      void executeRender();
    }, RENDER_DEBOUNCE_MS);

    return () => {
      clearTimeout(timerId);
    };
  }, [source, isDark]);

  const lineNumbers = useMemo(() => {
    const count = source.length > 0 ? source.split(/\r?\n/).length : 1;
    return Array.from({ length: count }, (_, index) => index + 1);
  }, [source]);

  const handleSelectPreset = useCallback(
    (presetId: MermaidPresetId) => {
      const preset = getMermaidPreset(presetId);
      if (source.trim().length > 0) {
        if (source.trim() !== preset.code.trim()) {
          setUndoSource(source);
        }
      } else {
        setUndoSource(null);
      }
      setSource(preset.code);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    },
    [source]
  );

  const handleClear = useCallback(() => {
    if (source.trim().length > 0) {
      setUndoSource(source);
    }
    setSource("");
    setRenderResult(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [source]);

  const handleUndo = useCallback(() => {
    if (undoSource === null) return;
    setSource(undoSource);
    setUndoSource(null);
  }, [undoSource]);

  const handleEditorScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = event.currentTarget.scrollTop;
    }
  };

  const handleCopy = async () => {
    if (!source.trim()) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(source);
      }
      setCopied(true);
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setCopied(false);
        }
      }, 2000);
    } catch (err) {
      console.error("Failed to copy Mermaid syntax:", err);
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        setSource(text);
        setUndoSource(null);
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const validSvg = !isEmpty && renderResult?.isValid && renderResult.svg ? renderResult.svg : null;
  const syntaxError = !isEmpty && renderResult && !renderResult.isValid ? renderResult.error ?? "Invalid Mermaid syntax." : null;

  const handleZoomOut = () => {
    setZoom((prev) => stepZoom(prev, -1));
  };

  const handleZoomIn = () => {
    setZoom((prev) => stepZoom(prev, 1));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFitZoom = () => {
    setPan({ x: 0, y: 0 });
    const viewport = viewportRef.current;
    const svgWidth = renderResult?.width;
    const svgHeight = renderResult?.height;

    if (
      viewport &&
      viewport.clientWidth > 0 &&
      viewport.clientHeight > 0 &&
      svgWidth &&
      svgHeight &&
      svgWidth > 0 &&
      svgHeight > 0
    ) {
      const padding = 48;
      const availableWidth = Math.max(1, viewport.clientWidth - padding);
      const availableHeight = Math.max(1, viewport.clientHeight - padding);
      const scale = Math.min(availableWidth / svgWidth, availableHeight / svgHeight);
      setZoom(clampZoom(scale));
      return;
    }

    setZoom(1);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!validSvg || event.button !== 0) return;
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originPan: pan,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPan({
      x: drag.originPan.x + (event.clientX - drag.startX),
      y: drag.originPan.y + (event.clientY - drag.startY),
    });
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!validSvg) return;
    const direction = event.deltaY < 0 ? 1 : -1;
    setZoom((prev) => {
      const step = Math.max(0.05, prev * 0.12);
      return clampZoom(prev + direction * step);
    });
  };

  const stats = renderResult?.stats ?? liveStats;
  const exportSlug =
    matchingPreset?.id ??
    (stats.diagramType.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "diagram");
  const dimensionWidth = renderResult?.width ? Math.round(renderResult.width) : null;
  const dimensionHeight = renderResult?.height ? Math.round(renderResult.height) : null;

  const handleExportSvg = () => {
    if (!validSvg) return;
    const blob = new Blob([validSvg], { type: "image/svg+xml;charset=utf-8" });
    triggerBlobDownload(blob, `mermaid-${exportSlug}.svg`);
  };

  const handleExportPng = async () => {
    if (!validSvg || isExportingPng) return;
    setIsExportingPng(true);
    try {
      const blob = await rasterizeSvgToPngBlob(validSvg, {
        scale: 2,
        backgroundColor: getMermaidThemeBackground(isDark),
      });
      triggerBlobDownload(blob, `mermaid-${exportSlug}.png`);
    } catch (err) {
      console.error("Failed to export PNG:", err);
    } finally {
      if (isMountedRef.current) {
        setIsExportingPng(false);
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Toolbar */}
      <div
        data-testid="mermaid-toolbar"
        className="rounded-none border border-border bg-card p-2.5 px-4 flex items-center justify-between flex-wrap gap-2"
      >
        <div className="flex items-center flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none h-7 px-3 text-xs font-mono"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-sky-400" />
                Templates
                <ChevronDown className="h-3.5 w-3.5 ml-1.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-none w-64">
              {MERMAID_PRESETS.map((preset) => {
                const isMatched = matchingPreset?.id === preset.id;
                return (
                  <DropdownMenuItem
                    key={preset.id}
                    onSelect={() => handleSelectPreset(preset.id)}
                    className="rounded-none flex items-start justify-between gap-2 py-2 cursor-pointer font-mono"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-medium text-foreground">{preset.label}</span>
                      <span className="text-[11px] text-muted-foreground leading-snug">
                        {preset.description}
                      </span>
                    </div>
                    {isMatched && <Check className="h-3.5 w-3.5 shrink-0 text-sky-500 mt-0.5" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {!isEmpty && (
            <span data-testid="template-status-label" className="text-xs font-mono text-muted-foreground">
              {matchingPreset ? `Template: ${matchingPreset.label}` : "Custom syntax"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {undoSource !== null && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none h-7 px-3 text-xs font-mono"
              onClick={handleUndo}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Undo
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none h-7 px-3 text-xs font-mono"
            onClick={handleClear}
            disabled={isEmpty}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* Main 1:2 Split Grid */}
      <div data-testid="mermaid-workspace-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Syntax Card (1/3 on desktop) */}
        <Card data-testid="syntax-card" className="rounded-none border-border flex flex-col lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2 space-y-0 p-4 border-b border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-sm font-semibold font-mono">Syntax</CardTitle>
              {isEmpty ? (
                <Badge
                  data-testid="syntax-status-badge"
                  variant="outline"
                  className="rounded-none font-mono text-xs text-muted-foreground"
                >
                  Empty
                </Badge>
              ) : syntaxError ? (
                <Badge
                  data-testid="syntax-status-badge"
                  variant="destructive"
                  className="rounded-none font-mono text-xs border border-destructive/60 bg-destructive/20 text-destructive"
                >
                  Invalid Syntax
                </Badge>
              ) : renderResult?.isValid ? (
                <Badge
                  data-testid="syntax-status-badge"
                  variant="outline"
                  className="rounded-none font-mono text-xs border-sky-500/60 bg-sky-950/30 text-sky-600 dark:text-sky-400"
                >
                  <Check className="h-3 w-3" />
                  Valid {stats.diagramType}
                </Badge>
              ) : null}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={isEmpty}
              className="rounded-none h-7 px-2.5 text-xs font-mono"
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
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="flex flex-row min-h-[220px] lg:min-h-[460px] flex-1 bg-background">
              <div
                ref={gutterRef}
                data-testid="syntax-line-gutter"
                aria-hidden="true"
                className="w-10 shrink-0 border-r border-border/60 bg-muted/20 py-3 pr-2 text-right font-mono text-xs md:text-sm leading-6 text-muted-foreground/70 select-none overflow-hidden"
              >
                {lineNumbers.map((lineNumber) => (
                  <div key={lineNumber} className="h-6">
                    {lineNumber}
                  </div>
                ))}
              </div>

              <Textarea
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  if (undoSource !== null) {
                    setUndoSource(null);
                  }
                }}
                onScroll={handleEditorScroll}
                aria-label="Mermaid syntax input"
                placeholder="Write Mermaid syntax here..."
                spellCheck={false}
                className="font-mono text-xs md:text-sm leading-6 rounded-none min-h-[220px] lg:min-h-[460px] flex-1 resize-none border-0 py-3 px-3 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground shadow-none"
              />
            </div>
          </CardContent>

          <div
            data-testid="syntax-footer"
            className="border-t border-border px-4 py-2 flex items-center justify-between gap-2 flex-wrap text-xs font-mono text-muted-foreground bg-muted/20"
          >
            <div data-testid="syntax-footer-stats" className="flex items-center gap-3">
              <span>Lines: {stats.lineCount}</span>
              <span>Nodes: {stats.nodeCount}</span>
              <span>Edges: {stats.edgeCount}</span>
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

        {/* Preview Card (2/3 on desktop) */}
        <Card data-testid="preview-card" className="rounded-none border-border flex flex-col lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2 space-y-0 p-4 border-b border-border">
            <CardTitle className="text-sm font-semibold font-mono">Preview</CardTitle>

            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Zoom out"
                  onClick={handleZoomOut}
                  disabled={!validSvg || zoom <= MIN_ZOOM}
                  className="rounded-none h-7 w-7 p-0 text-xs font-mono"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Reset zoom"
                  onClick={handleResetZoom}
                  disabled={!validSvg}
                  className="rounded-none h-7 px-2.5 text-xs font-mono border-x-0 min-w-[54px]"
                >
                  {Math.round(zoom * 100)}%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Zoom in"
                  onClick={handleZoomIn}
                  disabled={!validSvg || zoom >= MAX_ZOOM}
                  className="rounded-none h-7 w-7 p-0 text-xs font-mono"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFitZoom}
                disabled={!validSvg}
                className="rounded-none h-7 px-2.5 text-xs font-mono"
              >
                <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
                Fit
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleExportSvg}
                disabled={!validSvg}
                className="rounded-none h-7 px-3 text-xs font-mono bg-[#0069a8] dark:bg-[#00598a] text-white hover:bg-[#00598a] dark:hover:bg-[#0069a8]"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                SVG
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportPng}
                disabled={!validSvg || isExportingPng}
                className="rounded-none h-7 px-2.5 text-xs font-mono"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                PNG
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col">
            <div
              ref={viewportRef}
              data-testid="preview-viewport"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onWheel={handleWheel}
              style={{ backgroundColor: getMermaidThemeBackground(isDark) }}
              className={cn(
                "relative min-h-[300px] lg:min-h-[460px] flex-1 overflow-hidden flex items-center justify-center select-none",
                validSvg && (isDragging ? "cursor-grabbing" : "cursor-grab")
              )}
            >
              {isEmpty ? (
                <div className="p-6 text-center text-muted-foreground font-mono text-xs md:text-sm">
                  Enter Mermaid syntax on the left or pick a preset to preview your diagram.
                </div>
              ) : syntaxError ? (
                <div className="w-full max-w-xl p-6">
                  <div
                    role="alert"
                    className="rounded-none border border-destructive/60 bg-destructive/10 text-destructive p-4 font-mono text-xs md:text-sm space-y-1.5"
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Syntax Error</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words">{syntaxError}</p>
                  </div>
                </div>
              ) : validSvg ? (
                <>
                  <div
                    data-testid="preview-transform-wrapper"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: "center center",
                    }}
                    className={cn(
                      "p-6 shrink-0",
                      !isDragging && "transition-transform duration-75 ease-out"
                    )}
                  >
                    <div
                      data-testid="preview-svg-host"
                      style={
                        renderResult?.width && renderResult?.height
                          ? { width: `${renderResult.width}px`, height: `${renderResult.height}px` }
                          : undefined
                      }
                      className="[&_svg]:block [&_svg]:w-full! [&_svg]:h-full! [&_svg]:max-w-none!"
                      dangerouslySetInnerHTML={{ __html: validSvg }}
                    />
                  </div>
                  {dimensionWidth !== null && dimensionHeight !== null && (
                    <Badge
                      data-testid="preview-dimensions-badge"
                      variant="outline"
                      className="rounded-none font-mono text-xs absolute bottom-3 right-3 bg-card/90 border-border text-muted-foreground backdrop-blur-xs pointer-events-none"
                    >
                      SVG • {dimensionWidth}×{dimensionHeight}
                    </Badge>
                  )}
                </>
              ) : (
                <div className="p-6 text-center text-muted-foreground font-mono text-xs md:text-sm">
                  Rendering diagram...
                </div>
              )}
            </div>
          </CardContent>

          <div
            data-testid="preview-footer"
            className="border-t border-border px-4 py-2 flex items-center justify-between gap-2 flex-wrap text-xs font-mono text-muted-foreground bg-muted/20"
          >
            <div data-testid="preview-status-text">
              {isEmpty
                ? "Ready"
                : syntaxError
                  ? "Invalid syntax"
                  : renderResult?.isValid && renderResult.renderTimeMs !== undefined
                    ? `Rendered locally in ${renderResult.renderTimeMs}ms`
                    : "Ready"}
            </div>
            <div>Drag to pan • Scroll to zoom</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
