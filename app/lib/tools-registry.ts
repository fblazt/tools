import { lazy, type ComponentType } from "react";

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  component: React.LazyExoticComponent<ComponentType>;
}

export interface ToolCategory {
  title: string;
  tools: ToolDefinition[];
}

export const tools: ToolDefinition[] = [
  {
    id: "qr-generator",
    title: "QR Code Generator",
    description: "Generate QR codes from text or URLs",
    category: "Encoding Tools",
    keywords: ["qr", "code", "generator", "barcode", "scan"],
    component: lazy(() =>
      import("~/components/tools/qr-generator").then((m) => ({ default: m.QRGenerator }))
    ),
  },
  {
    id: "jwt-decoder",
    title: "JWT Decoder",
    description: "Decode and verify JSON Web Tokens",
    category: "Security Tools",
    keywords: ["jwt", "token", "decoder", "json", "web", "token"],
    component: lazy(() =>
      import("~/components/tools/jwt-decoder").then((m) => ({ default: m.JWTDecoder }))
    ),
  },
  {
    id: "image-to-webp",
    title: "Image to WebP Converter",
    description: "Convert images to WebP format",
    category: "Design Tools",
    keywords: ["image", "webp", "converter", "format", "picture", "photo"],
    component: lazy(() =>
      import("~/components/tools/image-to-webp").then((m) => ({ default: m.ImageToWebp }))
    ),
  },
  {
    id: "markdown-previewer",
    title: "Markdown Previewer",
    description: "Preview Markdown text with live formatting",
    category: "Text Tools",
    keywords: ["markdown", "preview", "md", "text", "formatting"],
    component: lazy(() =>
      import("~/components/tools/markdown-previewer").then((m) => ({
        default: m.MarkdownPreviewer,
      }))
    ),
  },
  {
    id: "json-api-tester",
    title: "JSON API Tester",
    description: "Test REST APIs with JSON payloads",
    category: "Development Tools",
    keywords: ["api", "test", "rest", "json", "http", "request"],
    component: lazy(() =>
      import("~/components/tools/json-api-tester").then((m) => ({ default: m.JsonApiTester }))
    ),
  },
];

export const toolsById = new Map(tools.map((t) => [t.id, t]));

export const toolsByCategory: ToolCategory[] = Object.values(
  tools.reduce(
    (acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = { title: tool.category, tools: [] };
      }
      acc[tool.category].tools.push(tool);
      return acc;
    },
    {} as Record<string, ToolCategory>
  )
);
