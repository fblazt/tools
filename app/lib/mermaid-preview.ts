export type MermaidPresetId = "flowchart" | "sequence" | "er" | "state";

export interface MermaidPreset {
  id: MermaidPresetId;
  label: string;
  shortLabel: string;
  code: string;
}

export interface MermaidDiagramStats {
  lineCount: number;
  nodeCount: number;
  edgeCount: number;
  diagramType: string;
}

export interface MermaidRenderResult {
  isValid: boolean;
  svg?: string;
  width?: number;
  height?: number;
  renderTimeMs?: number;
  error?: string;
  stats: MermaidDiagramStats;
}

export interface PngExportOptions {
  scale?: number;
  backgroundColor?: string;
}

const FLOWCHART_PRESET: MermaidPreset = {
  id: "flowchart",
  label: "Flowchart",
  shortLabel: "Flow",
  code: [
    "flowchart LR",
    '  A["Client Request"] --> B{"Auth Valid?"}',
    '  B -- "Yes" --> C["Rate Limiter"]',
    '  B -- "No" --> D["401 Unauthorized"]',
    '  C --> E{"Edge Cache"}',
    '  E -- "Miss" --> F["Origin API"]',
    '  E -- "Hit" --> G["200 OK"]',
  ].join("\n"),
};

const SEQUENCE_PRESET: MermaidPreset = {
  id: "sequence",
  label: "Sequence",
  shortLabel: "Seq",
  code: [
    "sequenceDiagram",
    "  autonumber",
    "  participant C as Client",
    "  participant A as Auth Server",
    "  participant R as Resource API",
    "  C->>A: POST /oauth/token",
    "  A-->>C: 200 Access Token",
    "  C->>R: GET /v1/profile (Bearer)",
    "  R-->>C: 200 JSON Payload",
  ].join("\n"),
};

const ER_PRESET: MermaidPreset = {
  id: "er",
  label: "ER Diagram",
  shortLabel: "ER",
  code: [
    "erDiagram",
    "  USER ||--o{ SESSION : starts",
    "  SESSION ||--o{ TOKEN : issues",
    "  USER {",
    "    uuid id PK",
    "    string email UK",
    "    timestamp created_at",
    "  }",
    "  SESSION {",
    "    uuid id PK",
    "    uuid user_id FK",
    "    timestamp expires_at",
    "  }",
    "  TOKEN {",
    "    uuid id PK",
    "    uuid session_id FK",
    "    string scope",
    "  }",
  ].join("\n"),
};

const STATE_PRESET: MermaidPreset = {
  id: "state",
  label: "State",
  shortLabel: "State",
  code: [
    "stateDiagram-v2",
    "  [*] --> Idle",
    "  Idle --> Parsing: Edit Syntax",
    "  Parsing --> Valid: AST OK",
    "  Parsing --> SyntaxError: Parse Failed",
    "  Valid --> Idle: Clear",
    "  SyntaxError --> Parsing: Fix Syntax",
  ].join("\n"),
};

export const MERMAID_PRESETS: readonly MermaidPreset[] = [
  FLOWCHART_PRESET,
  SEQUENCE_PRESET,
  ER_PRESET,
  STATE_PRESET,
];

/** Look up a starter preset by ID, falling back to the default flowchart preset. */
export function getMermaidPreset(id: MermaidPresetId): MermaidPreset {
  return MERMAID_PRESETS.find((preset) => preset.id === id) ?? FLOWCHART_PRESET;
}

const DIAGRAM_TYPE_KEYWORDS: Record<string, string> = {
  flowchart: "Flowchart",
  graph: "Flowchart",
  sequenceDiagram: "Sequence",
  erDiagram: "ER Diagram",
  stateDiagram: "State",
  "stateDiagram-v2": "State",
  classDiagram: "Class",
  gantt: "Gantt",
  pie: "Pie",
  gitGraph: "Git Graph",
  mindmap: "Mindmap",
};

const FLOWCHART_EDGE_REGEX =
  /<--+>|--+\s+(?:(?!--+>).)+?\s+--+>|---+\s+(?:(?!---+).)+?\s+---|-\.\s+(?:(?!\.-+>).)+?\s+\.-+>|==+\s+(?:(?!==+>).)+?\s+==+>|(?:o--o|x--x|<--?>|--+>|---+|\.-+>|-\.-+>|==+>)(?:\|[^|]*\|)?/g;

const FLOWCHART_IGNORED_PREFIXES = [
  "flowchart",
  "graph",
  "subgraph",
  "end",
  "direction",
  "classdef",
  "class ",
  "style ",
  "linkstyle",
  "click ",
  "acctitle",
  "accdescr",
];

const SEQUENCE_IGNORED_PREFIXES = [
  "sequencediagram",
  "autonumber",
  "loop",
  "alt",
  "else",
  "opt",
  "par",
  "and",
  "critical",
  "option",
  "break",
  "rect",
  "end",
  "note ",
  "activate ",
  "deactivate ",
  "box",
  "title",
  "acctitle",
  "accdescr",
  "create ",
  "destroy ",
];

const STATE_IGNORED_PREFIXES = [
  "statediagram",
  "direction ",
  "note ",
  "end note",
  "classdef ",
  "class ",
  "style ",
  "acctitle",
  "accdescr",
];

function getMeaningfulLines(source: string): string[] {
  const withoutDirectives = source.replace(/%%\{[\s\S]*?\}%%/g, "");
  return withoutDirectives
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("%%"));
}

function extractFlowchartNodeIds(segment: string): string[] {
  const ids: string[] = [];
  for (const part of segment.split("&")) {
    const cleaned = part.trim().replace(/^\|[^|]*\|\s*/, "");
    if (!cleaned || cleaned.toLowerCase() === "end") continue;
    const match = cleaned.match(/^([A-Za-z0-9_.-]+)/);
    if (match) {
      ids.push(match[1]);
    }
  }
  return ids;
}

function countFlowchartStats(lines: string[]): { nodeCount: number; edgeCount: number } {
  const nodes = new Set<string>();
  let edgeCount = 0;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (FLOWCHART_IGNORED_PREFIXES.some((prefix) => lower === prefix.trim() || lower.startsWith(prefix))) {
      continue;
    }

    const edgeMatches = line.match(FLOWCHART_EDGE_REGEX);
    if (edgeMatches && edgeMatches.length > 0) {
      edgeCount += edgeMatches.length;
      for (const segment of line.split(FLOWCHART_EDGE_REGEX)) {
        for (const id of extractFlowchartNodeIds(segment)) {
          nodes.add(id);
        }
      }
      continue;
    }

    const standaloneMatch = line.match(/^([A-Za-z0-9_.-]+)\s*(?:[[({].*|:::.*)?$/);
    if (standaloneMatch) {
      nodes.add(standaloneMatch[1]);
    }
  }

  return { nodeCount: nodes.size, edgeCount };
}

function countSequenceStats(lines: string[]): { nodeCount: number; edgeCount: number } {
  const nodes = new Set<string>();
  let edgeCount = 0;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (SEQUENCE_IGNORED_PREFIXES.some((prefix) => lower === prefix.trim() || lower.startsWith(prefix))) {
      continue;
    }

    const participantMatch = line.match(/^(?:participant|actor)\s+([^\s]+)(?:\s+as\s+.+)?$/i);
    if (participantMatch) {
      nodes.add(participantMatch[1]);
      continue;
    }

    const messageMatch = line.match(
      /^([^\s:<>-]+)\s*(?:<<--?>>?|--?>>?|--?x|--?\)|--?>)[+-]?\s*([^\s:]+)/,
    );
    if (messageMatch) {
      edgeCount += 1;
      nodes.add(messageMatch[1]);
      nodes.add(messageMatch[2]);
    }
  }

  return { nodeCount: nodes.size, edgeCount };
}

function countErStats(lines: string[]): { nodeCount: number; edgeCount: number } {
  const nodes = new Set<string>();
  let edgeCount = 0;
  let braceDepth = 0;

  for (const line of lines) {
    if (line.toLowerCase().startsWith("erdiagram")) continue;

    if (braceDepth > 0) {
      const opens = (line.match(/\{/g) ?? []).length;
      const closes = (line.match(/\}/g) ?? []).length;
      braceDepth = Math.max(0, braceDepth + opens - closes);
      continue;
    }

    const entityMatch = line.match(/^([A-Za-z0-9_-]+)\s*\{(.*)$/);
    if (entityMatch) {
      nodes.add(entityMatch[1]);
      if (!entityMatch[2].includes("}")) {
        braceDepth += 1;
      }
      continue;
    }

    const relationMatch = line.match(
      /^([A-Za-z0-9_-]+)\s+[|o}][|o](?:--|\.\.)[|o][|o{]\s+([A-Za-z0-9_-]+)(?:\s*:.*)?$/,
    );
    if (relationMatch) {
      edgeCount += 1;
      nodes.add(relationMatch[1]);
      nodes.add(relationMatch[2]);
    }
  }

  return { nodeCount: nodes.size, edgeCount };
}

function countStateStats(lines: string[]): { nodeCount: number; edgeCount: number } {
  const nodes = new Set<string>();
  let edgeCount = 0;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      line === "}" ||
      line === "--" ||
      STATE_IGNORED_PREFIXES.some((prefix) => lower === prefix.trim() || lower.startsWith(prefix))
    ) {
      continue;
    }

    const transitionMatch = line.match(/^([^\s:]+)\s*-->\s*([^\s:]+)/);
    if (transitionMatch) {
      edgeCount += 1;
      nodes.add(transitionMatch[1]);
      nodes.add(transitionMatch[2]);
      continue;
    }

    const aliasMatch = line.match(/^state\s+"[^"]+"\s+as\s+([A-Za-z0-9_-]+)/i);
    if (aliasMatch) {
      nodes.add(aliasMatch[1]);
      continue;
    }

    const stateDeclMatch = line.match(/^state\s+([A-Za-z0-9_-]+)(?:\s*\{|\s*:|$)/i);
    if (stateDeclMatch) {
      nodes.add(stateDeclMatch[1]);
    }
  }

  return { nodeCount: nodes.size, edgeCount };
}

/** Detect the human-readable Mermaid diagram type from source syntax. */
export function detectMermaidDiagramType(source: string): string {
  if (source.trim().length === 0) return "Empty";
  const lines = getMeaningfulLines(source);
  if (lines.length === 0) return "Empty";

  const firstToken = lines[0].split(/[\s:(]+/)[0] ?? "";
  return DIAGRAM_TYPE_KEYWORDS[firstToken] ?? "Diagram";
}

/** Compute heuristic line, node, edge, and diagram type statistics from Mermaid syntax. */
export function computeMermaidStats(source: string): MermaidDiagramStats {
  const trimmed = source.trim();
  const lineCount = trimmed.length === 0 ? 0 : source.split(/\r?\n/).length;
  const diagramType = detectMermaidDiagramType(source);

  if (diagramType === "Empty") {
    return { lineCount, nodeCount: 0, edgeCount: 0, diagramType };
  }

  const lines = getMeaningfulLines(source);

  if (diagramType === "Flowchart") {
    return { lineCount, diagramType, ...countFlowchartStats(lines) };
  }
  if (diagramType === "Sequence") {
    return { lineCount, diagramType, ...countSequenceStats(lines) };
  }
  if (diagramType === "ER Diagram") {
    return { lineCount, diagramType, ...countErStats(lines) };
  }
  if (diagramType === "State") {
    return { lineCount, diagramType, ...countStateStats(lines) };
  }

  return { lineCount, nodeCount: 0, edgeCount: 0, diagramType };
}

/** Return the brutalist canvas background hex color for the active theme. */
export function getMermaidThemeBackground(isDark: boolean): string {
  return isDark ? "#13130E" : "#F4F4F0";
}

/** Return the brutalist Mermaid `themeVariables` palette for dark or light mode. */
export function getMermaidThemeVariables(isDark: boolean): Record<string, string> {
  if (isDark) {
    return {
      darkMode: "true",
      background: "#13130E",
      primaryColor: "#1D1D16",
      primaryTextColor: "#FBFBF9",
      primaryBorderColor: "#00A6F4",
      lineColor: "#ABAB9C",
      secondaryColor: "#00598A",
      secondaryTextColor: "#FBFBF9",
      secondaryBorderColor: "#00A6F4",
      tertiaryColor: "#282828",
      tertiaryTextColor: "#FBFBF9",
      tertiaryBorderColor: "#ABAB9C",
      mainBkg: "#1D1D16",
      nodeBorder: "#00A6F4",
      clusterBkg: "#13130E",
      clusterBorder: "#282828",
      edgeLabelBackground: "#1D1D16",
      textColor: "#FBFBF9",
      actorBkg: "#1D1D16",
      actorBorder: "#00A6F4",
      actorTextColor: "#FBFBF9",
      actorLineColor: "#282828",
      signalColor: "#ABAB9C",
      signalTextColor: "#FBFBF9",
      labelBoxBkgColor: "#1D1D16",
      labelBoxBorderColor: "#282828",
      labelTextColor: "#FBFBF9",
      noteBkgColor: "#00598A",
      noteBorderColor: "#00A6F4",
      noteTextColor: "#FBFBF9",
      attributeBackgroundColorOdd: "#1D1D16",
      attributeBackgroundColorEven: "#13130E",
    };
  }

  return {
    darkMode: "false",
    background: "#F4F4F0",
    primaryColor: "#FFFFFF",
    primaryTextColor: "#0C0C09",
    primaryBorderColor: "#0069A8",
    lineColor: "#525243",
    secondaryColor: "#E0F2FE",
    secondaryTextColor: "#0C0C09",
    secondaryBorderColor: "#0069A8",
    tertiaryColor: "#F4F4F0",
    tertiaryTextColor: "#0C0C09",
    tertiaryBorderColor: "#D6D6CE",
    mainBkg: "#FFFFFF",
    nodeBorder: "#0069A8",
    clusterBkg: "#F4F4F0",
    clusterBorder: "#D6D6CE",
    edgeLabelBackground: "#FFFFFF",
    textColor: "#0C0C09",
    actorBkg: "#FFFFFF",
    actorBorder: "#0069A8",
    actorTextColor: "#0C0C09",
    actorLineColor: "#D6D6CE",
    signalColor: "#525243",
    signalTextColor: "#0C0C09",
    labelBoxBkgColor: "#FFFFFF",
    labelBoxBorderColor: "#D6D6CE",
    labelTextColor: "#0C0C09",
    noteBkgColor: "#E0F2FE",
    noteBorderColor: "#0069A8",
    noteTextColor: "#0C0C09",
    attributeBackgroundColorOdd: "#FFFFFF",
    attributeBackgroundColorEven: "#F4F4F0",
  };
}

const DEFAULT_SVG_DIMENSIONS = { width: 640, height: 360 };

function parsePositiveSvgLength(raw: string | undefined): number | null {
  if (!raw || raw.includes("%")) return null;
  const parsed = Number.parseFloat(raw.replace(/px$/i, "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Extract SVG pixel dimensions from `viewBox` or numeric `width`/`height` attributes. */
export function extractSvgDimensions(svg: string): { width: number; height: number } {
  const rootMatch = svg.match(/<svg\b([^>]*)>/i);
  if (!rootMatch) return { ...DEFAULT_SVG_DIMENSIONS };

  const attrs = rootMatch[1];
  const viewBoxMatch = attrs.match(/\bviewBox\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
  const viewBoxValue = viewBoxMatch?.[1] ?? viewBoxMatch?.[2];

  if (viewBoxValue) {
    const parts = viewBoxValue
      .trim()
      .split(/[\s,]+/)
      .map((part) => Number.parseFloat(part));
    if (parts.length === 4 && Number.isFinite(parts[2]) && Number.isFinite(parts[3]) && parts[2] > 0 && parts[3] > 0) {
      return { width: parts[2], height: parts[3] };
    }
  }

  const widthMatch = attrs.match(/\bwidth\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
  const heightMatch = attrs.match(/\bheight\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
  const width = parsePositiveSvgLength(widthMatch?.[1] ?? widthMatch?.[2]);
  const height = parsePositiveSvgLength(heightMatch?.[1] ?? heightMatch?.[2]);

  if (width !== null && height !== null) {
    return { width, height };
  }

  return { ...DEFAULT_SVG_DIMENSIONS };
}

/** Dynamically load Mermaid, validate syntax, and render an SVG diagram in the browser. */
export async function renderMermaidDiagram(
  renderId: string,
  source: string,
  isDark: boolean,
): Promise<MermaidRenderResult> {
  const stats = computeMermaidStats(source);
  const trimmed = source.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "Mermaid diagram syntax is empty.",
      stats,
    };
  }

  try {
    const startTime = performance.now();
    const { default: mermaid } = await import("mermaid");

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      themeVariables: getMermaidThemeVariables(isDark),
      flowchart: { htmlLabels: false },
      fontFamily: "Nunito Sans, Inter, sans-serif",
    });

    await mermaid.parse(trimmed);
    const rendered = await mermaid.render(renderId, trimmed);
    const renderTimeMs = Math.max(0, Math.round(performance.now() - startTime));
    const { width, height } = extractSvgDimensions(rendered.svg);

    return {
      isValid: true,
      svg: rendered.svg,
      width,
      height,
      renderTimeMs,
      stats,
    };
  } catch (err) {
    const message = err instanceof Error && err.message ? err.message : "Failed to render Mermaid diagram.";
    return {
      isValid: false,
      error: message,
      stats,
    };
  }
}

function normalizeSvgRootDimensions(svg: string, width: number, height: number): string {
  const svgTagRegex = /<svg\b([^>]*?)(\/?)>/i;
  if (!svgTagRegex.test(svg)) {
    throw new Error("Invalid SVG markup for PNG export.");
  }

  return svg.replace(svgTagRegex, (_match, rawAttrs: string, selfClose: string) => {
    const cleanedAttrs = rawAttrs
      .replace(/\s+\b(?:width|height)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s/>]+)/gi, "")
      .trimEnd();
    const xmlnsAttr = /\bxmlns\s*=/i.test(cleanedAttrs) ? "" : ' xmlns="http://www.w3.org/2000/svg"';
    return `<svg${cleanedAttrs}${xmlnsAttr} width="${width}" height="${height}"${selfClose}>`;
  });
}

/** Rasterize an SVG markup string onto an offscreen HTML5 canvas and return a PNG Blob. */
export async function rasterizeSvgToPngBlob(svg: string, options?: PngExportOptions): Promise<Blob> {
  const { width, height } = extractSvgDimensions(svg);
  const normalizedSvg = normalizeSvgRootDimensions(svg, width, height);
  const scale = options?.scale && options.scale > 0 ? options.scale : 2;
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(normalizedSvg)}`;

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load SVG into image for PNG export."));
    img.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is unavailable for PNG export.");
  }

  if (options?.backgroundColor) {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to encode PNG blob from canvas."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}
