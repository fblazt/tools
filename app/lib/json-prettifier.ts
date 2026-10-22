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
