import { useParams, Link } from "react-router";
import type { Route } from "./+types/tools.$toolId";
import { AppSidebar } from "~/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { QRGenerator } from "~/components/tools/qr-generator";

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
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tool Not Found</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-8">
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
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const ToolComponent = tool.component;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/#tools">Tools</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{tool.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
          <ToolComponent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
