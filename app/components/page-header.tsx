import * as React from "react";
import { Link } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { cn } from "~/lib/utils";

export interface BreadcrumbItemData {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  breadcrumbs?: BreadcrumbItemData[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  breadcrumbs,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  const heroRef = React.useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const element = heroRef.current;
    if (!element) return;

    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsScrolled(!entry.isIntersecting);
        },
        {
          rootMargin: "-20px 0px 0px 0px",
          threshold: 0,
        }
      );
      observer.observe(element);
      return () => observer.disconnect();
    } else {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 40);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <>
      {/* Sticky Top Pill */}
      <div
        data-slot="page-header-pill"
        data-scrolled={isScrolled}
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-30 select-none max-w-[calc(100vw-7rem)] truncate flex items-center gap-2 px-3.5 py-1.5 rounded-none border border-border bg-sidebar/85 backdrop-blur-2xl shadow-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isScrolled
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
        )}
      >
        {Icon && <Icon className="size-4 text-muted-foreground shrink-0" />}
        <span className="text-sm font-semibold tracking-tight text-foreground truncate">
          {title}
        </span>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* In-Content Hero Header */}
      <div ref={heroRef} className={cn("space-y-2", className)}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-2 font-mono text-xs">
            <BreadcrumbList className="font-mono text-xs">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.label + index}>
                    <BreadcrumbItem>
                      {isLast || !crumb.href ? (
                        <BreadcrumbPage className="font-mono text-xs">{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild className="font-mono text-xs">
                          <Link to={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight flex items-center gap-2.5">
                {Icon && <Icon className="size-6 sm:size-7 shrink-0 text-muted-foreground" />}
                <span>{title}</span>
              </h1>
              {badge && <div className="shrink-0">{badge}</div>}
            </div>

            {description && (
              <p className="font-mono text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div data-slot="page-header-actions" className="flex items-center gap-2 shrink-0 self-start">
              {actions}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
