import { lazy, type ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { QrCode, Shield, Image, FileText, Globe } from "lucide-react";

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  icon: LucideIcon;
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
    description: "Create customizable QR codes for text, URLs, and contact info",
    category: "Generators & Encoding",
    keywords: ["qr", "code", "generator", "barcode", "scan"],
    icon: QrCode,
    component: lazy(() =>
      import("~/components/tools/qr-generator").then((m) => ({ default: m.QRGenerator }))
    ),
  },
  {
    id: "jwt-decoder",
    title: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens and claims",
    category: "Security & Auth",
    keywords: ["jwt", "token", "decoder", "json", "web", "token"],
    icon: Shield,
    component: lazy(() =>
      import("~/components/tools/jwt-decoder").then((m) => ({ default: m.JWTDecoder }))
    ),
  },
  {
    id: "image-to-webp",
    title: "Image to WebP Converter",
    description: "Convert and optimize images to WebP format locally",
    category: "Media & Images",
    keywords: ["image", "webp", "converter", "format", "picture", "photo"],
    icon: Image,
    component: lazy(() =>
      import("~/components/tools/image-to-webp").then((m) => ({ default: m.ImageToWebp }))
    ),
  },
  {
    id: "markdown-previewer",
    title: "Markdown Previewer",
    description: "Live Markdown editor with GitHub Flavored Markdown and HTML export",
    category: "Text & Formatting",
    keywords: ["markdown", "preview", "md", "text", "formatting"],
    icon: FileText,
    component: lazy(() =>
      import("~/components/tools/markdown-previewer").then((m) => ({
        default: m.MarkdownPreviewer,
      }))
    ),
  },
  {
    id: "json-api-tester",
    title: "JSON API Tester",
    description: "Compose HTTP requests and inspect REST API responses",
    category: "Network & APIs",
    keywords: ["api", "test", "rest", "json", "http", "request"],
    icon: Globe,
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
