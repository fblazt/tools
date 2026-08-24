import { Link } from "react-router";
import type { Route } from "./+types/tools";
import { ExternalLink } from "lucide-react";
import { ToolsSearch } from "~/components/tools-search";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { toolsByCategory } from "~/lib/tools-registry";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tools — Fast & Private Developer Utilities" },
    { name: "description", content: "A suite of fast, in-browser developer utilities. All processing happens locally with zero server requests." },
    { property: "og:title", content: "Tools — Fast & Private Developer Utilities" },
    { property: "og:description", content: "A collection of privacy-focused developer tools that run entirely in your browser with zero tracking." },
    { property: "og:type", content: "website" },
  ];
}

export default function ToolsIndex() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center justify-between flex-1">
          <h1 className="text-lg font-semibold">Developer Tools</h1>
          <ToolsSearch />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
        <div>
          <p className="text-muted-foreground">
            Privacy-first utilities that run entirely in your browser — zero tracking, zero server uploads.
          </p>
        </div>
        {toolsByCategory.map((category) => (
          <section key={category.title}>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">{category.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.tools.map((tool) => {
                const Icon = tool.icon;
                const cardContent = (
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-muted p-2 group-hover:bg-background transition-colors">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center gap-1.5">
                        {tool.title}
                        {tool.externalUrl && (
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                    </div>
                  </div>
                );

                if (tool.externalUrl) {
                  return (
                    <a
                      key={tool.id}
                      href={tool.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-lg border p-4 hover:bg-accent transition-colors"
                    >
                      {cardContent}
                    </a>
                  );
                }

                return (
                  <Link
                    key={tool.id}
                    to={`/tools/${tool.id}`}
                    className="group rounded-lg border p-4 hover:bg-accent transition-colors"
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}