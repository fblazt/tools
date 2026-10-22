import { Link } from "react-router";
import type { Route } from "./+types/tools";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "~/components/page-header";
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
    <div className="flex flex-1 flex-col gap-8 pt-6 p-4 pb-24 md:p-8 md:pb-8 md:pl-24">
      <PageHeader
        title="Developer Tools"
        description="Privacy-first utilities that run entirely in your browser — zero tracking, zero server uploads."
      />
      {toolsByCategory.map((category) => (
        <section key={category.title}>
          <h2 className="font-mono text-xs font-semibold tracking-wider text-primary mb-2.5 uppercase">
            {category.title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {category.tools.map((tool) => {
              const Icon = tool.icon;
              const cardContent = (
                <>
                  <div className="size-10.5 rounded-none shrink-0 bg-muted border border-border flex items-center justify-center">
                    <Icon className="size-5 text-primary group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans font-semibold text-[15px] leading-snug flex items-center gap-1.5 text-foreground">
                      {tool.title}
                      {tool.externalUrl && (
                        <ExternalLink className="size-3.5 text-muted-foreground" />
                      )}
                    </h3>
                    <p className="font-mono text-xs text-muted-foreground mt-1 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </>
              );

              if (tool.externalUrl) {
                return (
                  <a
                    key={tool.id}
                    href={tool.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-start gap-3.5 p-4 rounded-none border border-border bg-card hover:border-primary/60 transition-colors"
                  >
                    {cardContent}
                  </a>
                );
              }

              return (
                <Link
                  key={tool.id}
                  to={`/tools/${tool.id}`}
                  className="group relative flex items-start gap-3.5 p-4 rounded-none border border-border bg-card hover:border-primary/60 transition-colors"
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}