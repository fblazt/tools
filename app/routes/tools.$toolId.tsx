import { Suspense } from "react";
import { useParams, Link } from "react-router";
import type { Route } from "./+types/tools.$toolId";
import { ExternalLink } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { ThemeToggle } from "~/components/theme-toggle";
import { ToolsSearch } from "~/components/tools-search";
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
      <>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Tool Not Found</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-3">
            <ToolsSearch />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pb-24 md:p-8 md:pb-8 md:pl-24">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Tool Not Found</h1>
            <p className="text-muted-foreground">
              The tool you're looking for doesn't exist.
            </p>
            <Link to="/" className="text-primary hover:underline">
              Go back home
            </Link>
          </div>
        </div>
      </>
    );
  }

  const Icon = tool.icon;
  const ToolComponent = tool.component;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{tool.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-3">
          <ToolsSearch />
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pb-24 md:p-8 md:pb-8 md:pl-24">
        {tool.externalUrl ? (
          <div className="mx-auto max-w-lg w-full mt-8">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto rounded-full bg-muted p-4 mb-2 w-fit">
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>
                  <h1 className="text-2xl font-semibold">{tool.title}</h1>
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  This tool is hosted externally. Click below to open it in a new tab.
                </p>
                <Button asChild className="w-full">
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
            <Suspense fallback={<div className="flex items-center justify-center p-8 text-muted-foreground">Loading tool...</div>}>
              <ToolComponent />
            </Suspense>
          </ToolErrorBoundary>
        ) : null}
      </div>
    </>
  );
}
