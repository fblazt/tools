import { Outlet } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";
import { ThemeToggle } from "~/components/theme-toggle";
import { ToolsSearch } from "~/components/tools-search";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar variant="floating" />
      <ThemeToggle className="fixed top-4 right-4 z-40" />
      <ToolsSearch showTrigger={false} />
      <SidebarInset className="min-w-0">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
