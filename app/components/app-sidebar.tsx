import * as React from "react"
import { useLocation, Link } from "react-router"
import { ExternalLink, Wrench } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "~/components/ui/sidebar"
import { cn } from "~/lib/utils"
import { tools, toolsByCategory } from "~/lib/tools-registry"

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isHomeActive = location.pathname === "/";
  
  return (
    <>
      <Sidebar
        variant="floating"
        className={cn(
          "group/dock w-14 hover:w-64 transition-all duration-300 ease-out",
          className
        )}
        {...props}
      >
        <SidebarHeader className="p-2 pb-2">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 group/brand focus-visible:outline-hidden"
            aria-label="Tools Home"
          >
            <div
              className={cn(
                "size-9.5 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95",
                isHomeActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Wrench className="size-4.5 shrink-0" />
            </div>
            <div className="flex flex-col min-w-0 transition-all duration-200 whitespace-nowrap overflow-hidden opacity-100 md:opacity-0 md:group-hover/dock:opacity-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-foreground">Tools</span>
                <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">Fast, private utilities</p>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarSeparator className="mx-3 my-1.5 opacity-60" />
        <SidebarContent className="px-2 py-1">
          {toolsByCategory.map((category) => (
            <SidebarGroup key={category.title} className="p-0 py-1">
              <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 h-6 whitespace-nowrap overflow-hidden transition-all duration-200 opacity-100 md:opacity-0 md:group-hover/dock:opacity-100">
                {category.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {category.tools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = !tool.externalUrl && location.pathname === `/tools/${tool.id}`;

                    if (tool.externalUrl) {
                      return (
                        <SidebarMenuItem key={tool.id}>
                          <SidebarMenuButton
                            asChild
                            className="h-9.5 rounded-full px-0 transition-all active:scale-95 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                          >
                            <a
                              href={tool.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleLinkClick}
                              className="flex items-center gap-2.5 w-full"
                            >
                              <div className="size-9.5 flex items-center justify-center shrink-0 rounded-full">
                                <Icon className="size-4.5 shrink-0 transition-transform duration-200 group-hover/menu-item:scale-110" />
                              </div>
                              <span className="text-sm font-medium truncate whitespace-nowrap transition-all duration-200 opacity-100 md:opacity-0 md:group-hover/dock:opacity-100 md:group-hover/dock:flex-1">
                                {tool.title}
                              </span>
                              <ExternalLink className="size-3.5 text-muted-foreground/60 shrink-0 mr-3 whitespace-nowrap transition-all duration-200 opacity-100 md:opacity-0 md:group-hover/dock:opacity-100" />
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }

                    return (
                      <SidebarMenuItem key={tool.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "h-9.5 rounded-full px-0 transition-all active:scale-95",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                          )}
                        >
                          <Link
                            to={`/tools/${tool.id}`}
                            onClick={handleLinkClick}
                            className="flex items-center gap-2.5 w-full"
                          >
                            <div className="size-9.5 flex items-center justify-center shrink-0 rounded-full">
                              <Icon className="size-4.5 shrink-0 transition-transform duration-200 group-hover/menu-item:scale-110" />
                            </div>
                            <span className="text-sm font-medium truncate whitespace-nowrap transition-all duration-200 opacity-100 md:opacity-0 md:group-hover/dock:opacity-100 md:group-hover/dock:flex-1">
                              {tool.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex md:hidden items-center gap-1.5 p-1.5 px-2.5 rounded-full border border-sidebar-border/80 bg-sidebar/85 dark:bg-sidebar/80 backdrop-blur-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-black/5 dark:ring-white/10 max-w-[calc(100vw-2rem)] overflow-x-auto scrollbar-none"
      >
        <Link
          to="/"
          className={cn(
            "size-9.5 rounded-full flex items-center justify-center shrink-0 text-foreground transition-all active:scale-95",
            isHomeActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
          )}
          title="Home"
          aria-label="Home"
        >
          <Wrench className="size-4.5 shrink-0" />
        </Link>
        <div className="h-5 w-px bg-sidebar-border/60 shrink-0" aria-hidden="true" />
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = !tool.externalUrl && location.pathname === `/tools/${tool.id}`;

          if (tool.externalUrl) {
            return (
              <a
                key={tool.id}
                href={tool.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "size-9.5 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95",
                  "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                )}
                title={tool.title}
                aria-label={tool.title}
              >
                <Icon className="size-4.5 shrink-0" />
              </a>
            );
          }

          return (
            <Link
              key={tool.id}
              to={`/tools/${tool.id}`}
              className={cn(
                "size-9.5 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              )}
              title={tool.title}
              aria-label={tool.title}
            >
              <Icon className="size-4.5 shrink-0" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
