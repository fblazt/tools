import { Link, Outlet } from "react-router";
import { Wrench, Search } from "lucide-react";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";
import { ThemeToggle } from "~/components/theme-toggle";
import { ToolsSearch, openToolsSearch } from "~/components/tools-search";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar variant="floating" />
      <ToolsSearch showTrigger={false} />

      {/* Mobile Top Header Island */}
      <header className="fixed top-0 left-0 right-0 z-40 flex md:hidden items-center justify-between px-4 py-2.5 bg-sidebar/90 backdrop-blur-md border-b border-border">
        <Link
          to="/"
          className="h-9 min-w-[140px] px-3.5 py-1.5 border border-border bg-sidebar flex items-center gap-2 rounded-none hover:bg-muted transition-colors"
          aria-label="Home"
        >
          <Wrench className="size-3.5 text-primary shrink-0" />
          <span className="font-mono text-[13px] font-semibold text-foreground">
            fblazt.tools
          </span>
        </Link>
        <div className="h-9 px-2.5 border border-border bg-sidebar flex items-center gap-2 rounded-none">
          <button
            type="button"
            onClick={() => openToolsSearch()}
            className="size-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Search tools"
          >
            <Search className="size-3.5" />
          </button>
          <div className="w-px h-4 bg-border" aria-hidden="true" />
          <ThemeToggle className="size-7 border-0 bg-transparent hover:bg-transparent" />
        </div>
      </header>

      <SidebarInset className="min-w-0 pt-14 md:pt-0">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
