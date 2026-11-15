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
