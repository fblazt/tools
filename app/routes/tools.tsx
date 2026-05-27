import { Link } from "react-router";
import type { Route } from "./+types/tools";
import { ToolsSearch } from "~/components/tools-search";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { toolsByCategory } from "~/lib/tools-registry";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tools - Client-Side Tools Collection" },
    { name: "description", content: "A collection of client-side developer tools" },
  ];
}

export default function ToolsIndex() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center justify-between flex-1">
          <h1 className="text-lg font-semibold">Tools</h1>
          <ToolsSearch />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
        <div>
          <p className="text-muted-foreground">
            All processing happens locally in your browser — no data is sent to external servers.
          </p>
        </div>
        {toolsByCategory.map((category) => (
          <section key={category.title}>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">{category.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    to={`/tools/${tool.id}`}
                    className="group rounded-lg border p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-muted p-2 group-hover:bg-background transition-colors">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{tool.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                      </div>
                    </div>
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