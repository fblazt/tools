import { Link } from "react-router";
import type { Route } from "./+types/404";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { PageHeader } from "~/components/page-header";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "404 Not Found — Tools" },
    { name: "description", content: "The requested page or tool could not be found" },
  ];
}

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col pt-6 p-4 pb-24 md:p-8 md:pb-8 md:pl-24">
      <PageHeader
        title="Page Not Found"
        description="The requested page or tool could not be found."
        breadcrumbs={[
          { label: "Tools", href: "/" },
          { label: "404" },
        ]}
      />
      <div className="flex flex-1 items-center justify-center min-h-[40vh] mt-6">
        <Card className="max-w-md w-full rounded-none border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-6xl font-bold font-mono text-muted-foreground">404</CardTitle>
            <CardDescription className="text-xl">
              Page Not Found
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm text-center">
              The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
            <div className="flex gap-2 pt-4">
              <Button asChild className="flex-1 rounded-none">
                <Link to="/">
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" className="rounded-none" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}