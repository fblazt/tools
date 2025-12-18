import type { Route } from "./+types/tools";
import { AppSidebar } from "~/components/app-sidebar";
import { ToolsSearch } from "~/components/tools-search";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tools - Client-Side Tools Collection" },
    { name: "description", content: "Select a tool from the sidebar to get started" },
  ];
}

export default function ToolsIndex() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center justify-between flex-1">
            <div>
              <h1 className="text-lg font-semibold">Tools</h1>
              <p className="text-sm text-muted-foreground">
                Choose a tool from the sidebar or search below
              </p>
            </div>
            <ToolsSearch />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4">
            <p className="text-muted-foreground">
              Select a tool from the sidebar to get started. All processing happens locally in your browser.
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}