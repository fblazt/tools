import { useParams, Link } from "react-router";
import type { Route } from "./+types/tools.$toolId";
import { ToolLayout } from "~/components/tool-layout";
import { QRGenerator } from "~/components/tools/qr-generator";
import { JWTDecoder } from "~/components/tools/jwt-decoder";
import { ImageToWebp } from "~/components/tools/image-to-webp";
import { MarkdownPreviewer } from "~/components/tools/markdown-previewer";

export function meta({ params }: Route.MetaArgs) {
  const toolName = params.toolId
    ?.split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return [
    { title: `${toolName} - fblazt-tools` },
    { name: "description", content: `Use our ${toolName} tool for client-side processing` },
  ];
}

// Tool registry - map tool IDs to their components
const toolComponents: Record<string, { component: React.ComponentType; title: string }> = {
  "qr-generator": {
    component: QRGenerator,
    title: "QR Code Generator",
  },
  "jwt-decoder": {
    component: JWTDecoder,
    title: "JWT Decoder",
  },
  "image-to-webp": {
    component: ImageToWebp,
    title: "Image to WebP Converter",
  },
  "markdown-previewer": {
    component: MarkdownPreviewer,
    title: "Markdown Previewer",
  },
  // Add more tools here as you create them
  // "json-formatter": {
  //   component: JsonFormatter,
  //   title: "JSON Formatter",
  // },
};

export default function ToolPage() {
  const params = useParams();
  const toolId = params.toolId || "";
  const tool = toolComponents[toolId];

  if (!tool) {
    return (
      <ToolLayout toolTitle="Tool Not Found">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Tool Not Found</h1>
          <p className="text-muted-foreground">
            The tool you're looking for doesn't exist.
          </p>
          <Link to="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </ToolLayout>
    );
  }

  const ToolComponent = tool.component;

  return (
    <ToolLayout toolTitle={tool.title}>
      <ToolComponent />
    </ToolLayout>
  );
}
