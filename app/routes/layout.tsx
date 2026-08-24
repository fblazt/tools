import { Outlet } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar variant="floating" />
      <SidebarInset className="min-w-0">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
