import type { Route } from "./+types/tools._index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tools - Client-Side Tools Collection" },
    { name: "description", content: "Select a tool from the sidebar to get started" },
  ];
}

export default function ToolsIndex() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Select a Tool</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        Choose a tool from the sidebar to get started. All processing happens locally in your browser.
      </p>
    </div>
  );
}