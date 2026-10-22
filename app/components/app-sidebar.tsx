import * as React from "react";
import { useLocation, Link } from "react-router";
import { ExternalLink, Wrench } from "lucide-react";

import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import { tools, toolsByCategory } from "~/lib/tools-registry";

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
      {/* Desktop Floating Dock */}
      <nav
        aria-label="Desktop Dock"
        className={cn(
          "fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-2 p-[10px_8px] w-14 select-none rounded-none border border-[#e8e8e3] dark:border-[#282828] bg-[#fbfbf9] dark:bg-[#1d1d16] shadow-xl",
          className
        )}
        {...props}
      >
        {/* Brand Button (Wrench icon) */}
        <div className="relative size-10 flex items-center shrink-0">
          <Link
            to="/"
            onClick={handleLinkClick}
            aria-label="Tools Home"
            className="size-10 flex items-center justify-center rounded-none bg-[#0069a8] dark:bg-[#00598a] text-[#f0f9ff] hover:opacity-95 transition-opacity focus-visible:outline-hidden"
          >
            <Wrench className="size-4.5 text-[#f0f9ff] shrink-0" />
            <span className="sr-only">Tools</span>
          </Link>
        </div>

        {/* Dock Divider */}
        <div className="w-6 h-px bg-[#e8e8e3] dark:bg-[#282828] my-0.5" aria-hidden="true" />

        {/* Dock Nav Items */}
        <div className="flex flex-col items-center gap-2">
          {toolsByCategory.map((category) => (
            <div key={category.title} className="flex flex-col items-center gap-2">
              <span className="sr-only">{category.title}</span>
              {category.tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = !tool.externalUrl && location.pathname === `/tools/${tool.id}`;

                if (tool.externalUrl) {
                  return (
                    <div
                      key={tool.id}
                      data-active={false}
                      className="group/item relative size-[38px] flex items-center shrink-0"
                    >
                      <a
                        href={tool.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleLinkClick}
                        aria-label={tool.title}
                        className={cn(
                          "absolute left-0 top-0 h-[38px] w-[38px] max-w-[38px] group-hover/item:max-w-[280px] flex items-center pl-[10px] pr-0 group-hover/item:pr-4 rounded-none transition-[max-width,background-color,border-color,box-shadow] duration-200 ease-out z-10 group-hover/item:z-50 overflow-hidden focus-visible:outline-hidden",
                          "bg-transparent text-[#7c7c67] dark:text-[#abab9c]",
                          "group-hover/item:bg-white group-hover/item:dark:bg-[#23231b] group-hover/item:border group-hover/item:border-[#0069a8] group-hover/item:dark:border-[#00a6f4] group-hover/item:shadow-xl"
                        )}
                      >
                        <div className="size-[18px] flex items-center justify-center shrink-0">
                          <Icon className="size-[18px] shrink-0 transition-colors text-[#7c7c67] dark:text-[#abab9c] group-hover/item:text-[#0069a8] group-hover/item:dark:text-[#00a6f4]" />
                        </div>
                        <span className="font-mono text-[12.5px] font-semibold text-[#0c0c09] dark:text-[#fbfbf9] whitespace-nowrap pl-2.5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 delay-75">
                          {tool.title}
                        </span>
                        <ExternalLink className="size-3.5 text-[#7c7c67] dark:text-[#abab9c] ml-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 delay-75 shrink-0" />
                      </a>
                    </div>
                  );
                }

                return (
                  <div
                    key={tool.id}
                    data-active={isActive}
                    className="group/item relative size-[38px] flex items-center shrink-0"
                  >
                    <Link
                      to={`/tools/${tool.id}`}
                      onClick={handleLinkClick}
                      data-active={isActive}
                      aria-label={tool.title}
                      className={cn(
                        "absolute left-0 top-0 h-[38px] w-[38px] max-w-[38px] group-hover/item:max-w-[280px] flex items-center pl-[10px] pr-0 group-hover/item:pr-4 rounded-none transition-[max-width,background-color,border-color,box-shadow] duration-200 ease-out z-10 group-hover/item:z-50 overflow-hidden focus-visible:outline-hidden",
                        isActive
                          ? "bg-[#0069a8] dark:bg-[#00598a] text-[#f0f9ff]"
                          : "bg-transparent text-[#7c7c67] dark:text-[#abab9c]",
                        "group-hover/item:bg-white group-hover/item:dark:bg-[#23231b] group-hover/item:border group-hover/item:border-[#0069a8] group-hover/item:dark:border-[#00a6f4] group-hover/item:shadow-xl"
                      )}
                    >
                      <div className="size-[18px] flex items-center justify-center shrink-0">
                        <Icon
                          className={cn(
                            "size-[18px] shrink-0 transition-colors group-hover/item:text-[#0069a8] group-hover/item:dark:text-[#00a6f4]",
                            isActive ? "text-[#f0f9ff]" : "text-[#7c7c67] dark:text-[#abab9c]"
                          )}
                        />
                      </div>
                      <span className="font-mono text-[12.5px] font-semibold text-[#0c0c09] dark:text-[#fbfbf9] whitespace-nowrap pl-2.5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 delay-75">
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

      {/* Mobile Floating Bottom Island Dock */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex md:hidden items-center justify-between w-[280px] h-[52px] px-2 rounded-none border border-[#e8e8e3] dark:border-[#282828] bg-[#fbfbf9] dark:bg-[#1d1d16] shadow-2xl select-none"
      >
        <Link
          to="/"
          onClick={handleLinkClick}
          className={cn(
            "size-[38px] flex items-center justify-center rounded-none shrink-0 transition-all active:scale-95",
            isHomeActive
              ? "bg-[#0069a8] dark:bg-[#00598a] text-[#f0f9ff]"
              : "text-[#7c7c67] dark:text-[#abab9c] hover:bg-[#f4f4f0] dark:hover:bg-[#2b2b22]"
          )}
          title="Home"
          aria-label="Home"
        >
          <Wrench className="size-4 shrink-0" />
        </Link>
        <div className="w-[1px] h-5 bg-[#e8e8e3] dark:bg-[#282828] shrink-0" aria-hidden="true" />
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
                  "size-[38px] flex items-center justify-center rounded-none shrink-0 transition-all active:scale-95",
                  "text-[#7c7c67] dark:text-[#abab9c] hover:bg-[#f4f4f0] dark:hover:bg-[#2b2b22]"
                )}
                title={tool.title}
                aria-label={tool.title}
              >
                <Icon className="size-4 shrink-0" />
              </a>
            );
          }

          return (
            <Link
              key={tool.id}
              to={`/tools/${tool.id}`}
              onClick={handleLinkClick}
              className={cn(
                "size-[38px] flex items-center justify-center rounded-none shrink-0 transition-all active:scale-95",
                isActive
                  ? "bg-[#0069a8] dark:bg-[#00598a] text-[#f0f9ff]"
                  : "text-[#7c7c67] dark:text-[#abab9c] hover:bg-[#f4f4f0] dark:hover:bg-[#2b2b22]"
              )}
              title={tool.title}
              aria-label={tool.title}
            >
              <Icon className="size-4 shrink-0" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
