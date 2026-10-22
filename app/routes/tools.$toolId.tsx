import { Suspense } from "react";
import { useParams, Link } from "react-router";
import type { Route } from "./+types/tools.$toolId";
import { ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { PageHeader } from "~/components/page-header";
import { ToolErrorBoundary } from "~/components/tool-error-boundary";
import { toolsById } from "~/lib/tools-registry";

export function meta({ params }: Route.MetaArgs) {
  const toolName = params.toolId
    ?.split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return [
    { title: `${toolName} — Tools` },
    { name: "description", content: `${toolName} — fast, private, and runs entirely in your browser with no server uploads.` },
    { property: "og:title", content: `${toolName} — Tools` },
    { property: "og:description", content: `${toolName} — fast, private, and runs entirely in your browser with no server uploads.` },
    { property: "og:type", content: "website" },
  ];
}

export default function ToolPage() {
  const params = useParams();
  const toolId = params.toolId || "";
  const tool = toolsById.get(toolId);

  if (!tool) {
    return (
      <div className="flex flex-1 flex-col gap-4 pt-6 p-4 pb-24 md:p-8 md:pb-8 md:pl-24">
        <PageHeader
          title="Tool Not Found"
          breadcrumbs={[
            { label: "Tools", href: "/" },
            { label: "Tool Not Found" },
          ]}
        />
        <div className="text-center space-y-4 py-8">
          <p className="text-muted-foreground">
            The tool you're looking for doesn't exist.
          </p>
          <Link to="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const Icon = tool.icon;
  const ToolComponent = tool.component;

  return (
    <div className="flex flex-1 flex-col gap-4 pt-6 p-4 pb-24 md:p-8 md:pb-8 md:pl-24">
      <PageHeader
        title={tool.title}
        description={tool.description}
        icon={tool.icon}
        breadcrumbs={[
          { label: "Tools", href: "/" },
          { label: tool.title },
        ]}
      />
      {tool.externalUrl ? (
        <div className="mx-auto max-w-lg w-full mt-4">
          <Card className="rounded-none border-border">
            <CardHeader className="text-center">
              <div className="mx-auto rounded-none border border-border bg-muted/40 p-4 mb-2 w-fit">
                <Icon className="h-8 w-8 text-foreground" />
              </div>
              <CardTitle>{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                This tool is hosted externally. Click below to open it in a new tab.
              </p>
              <Button asChild className="w-full rounded-none">
                <a href={tool.externalUrl} target="_blank" rel="noopener noreferrer">
                  Open {tool.title} <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <div>
                <Link to="/" className="text-sm text-primary hover:underline">
                  Back to all tools
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : ToolComponent ? (
        <ToolErrorBoundary toolName={tool.title}>
          <Suspense fallback={<div className="flex items-center justify-center p-8 text-muted-foreground font-mono text-sm">Loading tool...</div>}>
            <ToolComponent />
          </Suspense>
        </ToolErrorBoundary>
      ) : null}
    </div>
  );
}
