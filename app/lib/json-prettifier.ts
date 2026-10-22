export type JsonNodeType = "object" | "array" | "string" | "number" | "boolean" | "null";

export interface JsonFormatterOptions {
  indent: 2 | 4;
}

export interface JsonDiagnosticStats {
  rawBytes: number;
  formattedBytes: number;
  minifiedBytes: number;
  lineCount: number;
  depth: number;
  keyCount: number;
  reductionPercentage: number;
}

export interface JsonValidationError {
  message: string;
  line?: number;
  column?: number;
}

export interface JsonValidationResult {
  isValid: boolean;
  error?: JsonValidationError;
  formatted?: string;
  stats?: JsonDiagnosticStats;
}

export interface JsonNode {
  id: string;
  key?: string;
  value: any;
  type: JsonNodeType;
  depth: number;
  children?: JsonNode[];
  itemCount?: number;
}

export const SAMPLE_JSON = JSON.stringify(
  {
    user: {
      id: "usr_94821a",
      name: "Alex Vance",
      email: "alex.vance@example.com",
      profile: {
        title: "Senior Staff Engineer",
        department: "Core Systems",
        location: "San Francisco, CA",
        active: true,
      },
      roles: ["admin", "developer", "auditor"],
      settings: {
        theme: "dark",
        notifications: {
          email: true,
          push: false,
          frequency: "daily",
        },
        display: {
          density: "compact",
          showGutter: true,
        },
      },
      metadata: {
        lastLogin: "2026-10-22T09:15:30Z",
        loginCount: 142,
        verified: true,
        flags: null,
      },
    },
  },
  null,
  2
);

export function detectJsonType(val: any): JsonNodeType {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  const t = typeof val;
  if (t === "object") return "object";
  if (t === "string") return "string";
  if (t === "number") return "number";
  if (t === "boolean") return "boolean";
  return "string";
}

export function calculateJsonDepth(data: any): number {
  if (data === null || typeof data !== "object") {
    return 1;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return 1;
    return 1 + Math.max(...data.map(calculateJsonDepth));
  }
  const keys = Object.keys(data);
  if (keys.length === 0) return 1;
  return 1 + Math.max(...keys.map((k) => calculateJsonDepth(data[k])));
}

export function calculateJsonKeyCount(data: any): number {
  if (data === null || typeof data !== "object") {
    return 0;
  }
  if (Array.isArray(data)) {
    return data.reduce((acc, item) => acc + calculateJsonKeyCount(item), 0);
  }
  const keys = Object.keys(data);
  return (
    keys.length +
    keys.reduce((acc, key) => acc + calculateJsonKeyCount(data[key]), 0)
  );
}

export function parseJsonSyntaxError(err: unknown, rawText: string): JsonValidationError {
  const message = err instanceof Error ? err.message : String(err);

  // 1. Check for explicit line & column (e.g. "line 2 column 5" or "(line 2 column 5)")
  const lineColMatch = message.match(/line\s+(\d+)\s+col(?:umn)?\s+(\d+)/i);
  if (lineColMatch) {
    return {
      message,
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    };
  }

  // 2. Check for "at position X" in message
  const posMatch = message.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = Math.min(parseInt(posMatch[1], 10), rawText.length);
    const upToPos = rawText.slice(0, pos);
    const lines = upToPos.split("\n");
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    return {
      message,
      line,
      column,
    };
  }

  // 3. Fallback for "end of JSON input" or "end of data"
  if (/end of/i.test(message)) {
    const lines = rawText.split("\n");
    return {
      message,
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  }

  // 4. Default fallback
  return {
    message,
    line: 1,
    column: 1,
  };
}

export function validateAndFormatJson(
  rawText: string,
  options?: JsonFormatterOptions
): JsonValidationResult {
  if (!rawText || rawText.trim() === "") {
    return {
      isValid: false,
      error: {
        message: "JSON input is empty",
        line: 1,
        column: 1,
      },
    };
  }

  try {
    const parsed = JSON.parse(rawText);
    const indent = options?.indent ?? 2;
    const formatted = JSON.stringify(parsed, null, indent);
    const minified = JSON.stringify(parsed);

    const encoder = new TextEncoder();
    const rawBytes = encoder.encode(rawText).length;
    const formattedBytes = encoder.encode(formatted).length;
    const minifiedBytes = encoder.encode(minified).length;
    const lineCount = formatted.split("\n").length;
    const depth = calculateJsonDepth(parsed);
    const keyCount = calculateJsonKeyCount(parsed);

    const reductionPercentage =
      rawBytes > 0
        ? Math.max(0, Math.round(((rawBytes - minifiedBytes) / rawBytes) * 100))
        : 0;

    const stats: JsonDiagnosticStats = {
      rawBytes,
      formattedBytes,
      minifiedBytes,
      lineCount,
      depth,
      keyCount,
      reductionPercentage,
    };

    return {
      isValid: true,
      formatted,
      stats,
    };
  } catch (err: unknown) {
    const error = parseJsonSyntaxError(err, rawText);
    return {
      isValid: false,
      error,
    };
  }
}

export function buildJsonNodeTree(
  data: any,
  rootId: string = "root",
  depth: number = 1,
  key?: string
): JsonNode {
  const type = detectJsonType(data);

  if (type === "object") {
    const keys = Object.keys(data);
    const children: JsonNode[] = keys.map((k) => {
      const childId = `${rootId}.${k}`;
      return buildJsonNodeTree(data[k], childId, depth + 1, k);
    });

    return {
      id: rootId,
      key,
      value: data,
      type: "object",
      depth,
      children,
      itemCount: keys.length,
    };
  }

  if (type === "array") {
    const children: JsonNode[] = data.map((item: any, idx: number) => {
      const childId = `${rootId}[${idx}]`;
      return buildJsonNodeTree(item, childId, depth + 1, String(idx));
    });

    return {
      id: rootId,
      key,
      value: data,
      type: "array",
      depth,
      children,
      itemCount: data.length,
    };
  }

  return {
    id: rootId,
    key,
    value: data,
    type,
    depth,
  };
}

export function collectAllCollapsibleNodeIds(node: JsonNode): string[] {
  const ids: string[] = [];

  function traverse(n: JsonNode) {
    if ((n.type === "object" || n.type === "array") && (n.itemCount ?? 0) > 0) {
      ids.push(n.id);
    }
    if (n.children && n.children.length > 0) {
      for (const child of n.children) {
        traverse(child);
      }
    }
  }

  traverse(node);
  return ids;
}
