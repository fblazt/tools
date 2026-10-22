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
      <header className="fixed top-0 left-0 right-0 z-40 flex md:hidden items-center justify-between px-4 py-2.5 bg-[#fbfbf9]/90 dark:bg-[#0c0c09]/90 backdrop-blur-md border-b border-[#e8e8e3] dark:border-[#282828]">
        <Link
          to="/"
          className="h-9 min-w-[140px] px-3.5 py-1.5 border border-[#e8e8e3] dark:border-[#282828] bg-[#fbfbf9] dark:bg-[#1d1d16] flex items-center gap-2 rounded-none hover:bg-[#f4f4f0] dark:hover:bg-[#23231b] transition-colors"
          aria-label="Home"
        >
          <Wrench className="size-3.5 text-[#0069a8] dark:text-[#00a6f4] shrink-0" />
          <span className="font-mono text-[13px] font-semibold text-[#0c0c09] dark:text-[#fbfbf9]">
            fblazt.tools
          </span>
        </Link>
        <div className="h-9 px-2.5 border border-[#e8e8e3] dark:border-[#282828] bg-[#fbfbf9] dark:bg-[#1d1d16] flex items-center gap-2 rounded-none">
          <button
            type="button"
            onClick={() => openToolsSearch()}
            className="size-7 flex items-center justify-center text-[#7c7c67] dark:text-[#abab9c] hover:text-foreground transition-colors cursor-pointer"
            aria-label="Search tools"
          >
            <Search className="size-3.5" />
          </button>
          <div className="w-px h-4 bg-[#e8e8e3] dark:bg-[#282828]" aria-hidden="true" />
          <ThemeToggle className="size-7 border-0 bg-transparent hover:bg-transparent" />
        </div>
      </header>

      <SidebarInset className="min-w-0 pt-14 md:pt-0">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
