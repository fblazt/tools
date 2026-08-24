import { Link } from "react-router";
import type { Route } from "./+types/404";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ToolsSearch } from "~/components/tools-search";
import { ThemeToggle } from "~/components/theme-toggle";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "404 Not Found — Tools" },
    { name: "description", content: "The requested page or tool could not be found" },
  ];
}

export default function NotFound() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-8">
        <h1 className="text-lg font-semibold">Page Not Found</h1>
        <div className="flex items-center gap-3">
          <ToolsSearch />
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center min-h-[50vh] p-4 pb-24 md:p-8 md:pb-8 md:pl-24">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-6xl font-bold text-muted-foreground">404</CardTitle>
            <CardDescription className="text-xl">
              Page Not Found
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
            <div className="flex gap-2 pt-4">
              <Button asChild className="flex-1">
                <Link to="/">
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}