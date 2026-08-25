import * as React from "react"
import { useLocation, Link } from "react-router"
import { ExternalLink, Wrench } from "lucide-react"

import { useSidebar } from "~/components/ui/sidebar"
import { cn } from "~/lib/utils"
import { tools, toolsByCategory } from "~/lib/tools-registry"

export function AppSidebar({ className, ...props }: React.HTMLAttributes<HTMLElement> & { variant?: string }) {
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
      {/* Desktop Floating Pill Dock */}
      <nav
        aria-label="Desktop Dock"
        className={cn(
          "fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center p-2 rounded-full border border-sidebar-border/80 bg-sidebar/85 dark:bg-sidebar/80 backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/10 w-13.5 select-none",
          className
        )}
        {...props}
      >
        {/* Brand Header Pill */}
        <div className="group/brand relative size-9.5 z-10 hover:z-30">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="absolute left-0 top-0 flex items-center h-9.5 rounded-full focus-visible:outline-hidden"
            aria-label="Tools Home"
          >
            <div
              className={cn(
                "flex items-center h-9.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0",
                "w-9.5 group-hover/brand:w-max group-hover/brand:shadow-xl group-hover/brand:ring-1 group-hover/brand:ring-black/5 group-hover/brand:dark:ring-white/10 group-hover/brand:bg-sidebar/95 group-hover/brand:dark:bg-sidebar/90 group-hover/brand:backdrop-blur-2xl group-hover/brand:border group-hover/brand:border-sidebar-border/80",
                isHomeActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/80"
              )}
            >
              <div className="size-9.5 rounded-full flex items-center justify-center shrink-0">
                <Wrench className="size-4.5 shrink-0 transition-transform duration-200 group-hover/brand:scale-110" />
              </div>
              <span className="text-sm font-semibold tracking-tight whitespace-nowrap pr-4 pl-1 transition-all duration-200 opacity-0 group-hover/brand:opacity-100 max-w-0 group-hover/brand:max-w-xs">
                Tools
              </span>
            </div>
          </Link>
        </div>

        <div className="w-6 h-px bg-sidebar-border/60 my-1.5 shrink-0" aria-hidden="true" />

        {/* Tools Menu */}
        <div className="flex flex-col items-center gap-1">
          {toolsByCategory.map((category) => (
            <div key={category.title} className="flex flex-col items-center gap-1">
              <span className="sr-only">{category.title}</span>
              {category.tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = !tool.externalUrl && location.pathname === `/tools/${tool.id}`;

                if (tool.externalUrl) {
                  return (
                    <div key={tool.id} className="group/item relative size-9.5 z-10 hover:z-30">
                      <a
                        href={tool.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleLinkClick}
                        className={cn(
                          "absolute left-0 top-0 flex items-center h-9.5 rounded-full focus-visible:outline-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0",
                          "w-9.5 group-hover/item:w-max group-hover/item:shadow-xl group-hover/item:ring-1 group-hover/item:ring-black/5 group-hover/item:dark:ring-white/10 group-hover/item:bg-sidebar/95 group-hover/item:dark:bg-sidebar/90 group-hover/item:backdrop-blur-2xl group-hover/item:border group-hover/item:border-sidebar-border/80 group-hover/item:bg-sidebar-accent/90",
                          "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="size-9.5 rounded-full flex items-center justify-center shrink-0">
                          <Icon className="size-4.5 shrink-0 transition-transform duration-200 group-hover/item:scale-110" />
                        </div>
                        <span className="text-sm font-medium whitespace-nowrap pl-1 pr-2 transition-all duration-200 opacity-0 group-hover/item:opacity-100 max-w-0 group-hover/item:max-w-xs">
                          {tool.title}
                        </span>
                        <ExternalLink className="size-3.5 text-muted-foreground/70 shrink-0 mr-3.5 whitespace-nowrap transition-all duration-200 opacity-0 group-hover/item:opacity-100" />
                      </a>
                    </div>
                  );
                }

                return (
                  <div
                    key={tool.id}
                    data-active={isActive}
                    className="group/item relative size-9.5 z-10 hover:z-30"
                  >
                    <Link
                      to={`/tools/${tool.id}`}
                      onClick={handleLinkClick}
                      data-active={isActive}
                      className={cn(
                        "absolute left-0 top-0 flex items-center h-9.5 rounded-full focus-visible:outline-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0",
                        "w-9.5 group-hover/item:w-max group-hover/item:shadow-xl group-hover/item:ring-1 group-hover/item:ring-black/5 group-hover/item:dark:ring-white/10 group-hover/item:bg-sidebar/95 group-hover/item:dark:bg-sidebar/90 group-hover/item:backdrop-blur-2xl group-hover/item:border group-hover/item:border-sidebar-border/80",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/80"
                      )}
                    >
                      <div className="size-9.5 rounded-full flex items-center justify-center shrink-0">
                        <Icon className="size-4.5 shrink-0 transition-transform duration-200 group-hover/item:scale-110" />
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap pr-4 pl-1 transition-all duration-200 opacity-0 group-hover/item:opacity-100 max-w-0 group-hover/item:max-w-xs">
                        {tool.title}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile Floating Bottom Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex md:hidden items-center gap-1.5 p-1.5 px-2.5 rounded-full border border-sidebar-border/80 bg-sidebar/85 dark:bg-sidebar/80 backdrop-blur-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-black/5 dark:ring-white/10 max-w-[calc(100vw-2rem)] overflow-x-auto scrollbar-none"
      >
        <Link
          to="/"
          onClick={handleLinkClick}
          className={cn(
            "size-9.5 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95",
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
                onClick={handleLinkClick}
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
              onClick={handleLinkClick}
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
