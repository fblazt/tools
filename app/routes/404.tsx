import { Link } from "react-router";
import type { Route } from "./+types/404";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { AppSidebar } from "~/components/app-sidebar";
import { ToolsSearch } from "~/components/tools-search";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Page Not Found - Tools" },
    { name: "description", content: "The page you're looking for doesn't exist" },
  ];
}

export default function NotFound() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Page Not Found</h1>
            </div>
            <ToolsSearch />
          </div>
          
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
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
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Here are some things you can try:
                  </p>
                  <ul className="text-sm text-muted-foreground text-left space-y-1">
                    <li>• Check the URL for typos</li>
                    <li>• Go back to the previous page</li>
                    <li>• Use the sidebar to navigate to available tools</li>
                  </ul>
                </div>
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}