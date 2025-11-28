import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "fblazt-tools - Client-Side Tools Collection" },
    { name: "description", content: "A collection of client-side processing tools for various tasks" },
  ];
}

// Implemented tools
const tools = [
  {
    id: "qr-generator",
    title: "QR Code Generator",
    description: "Generate QR codes from text or URLs instantly in your browser",
    category: "Encoding"
  },
  {
    id: "jwt-decoder",
    title: "JWT Decoder",
    description: "Decode and verify JSON Web Tokens without sending data to servers",
    category: "Security"
  },
  {
    id: "image-to-webp",
    title: "Image to WebP Converter",
    description: "Convert images to WebP format for better compression and quality",
    category: "Design"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              fblazt-tools
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              A collection of client-side tools for developers
            </p>
            <p className="text-base md:text-lg text-muted-foreground">
              All processing happens in your browser. No data is sent to servers.
              Privacy-first, fast, and always available.
            </p>
          </div>

          <div className="flex gap-4">
            <Button size="lg" className="text-base" asChild>
              <a href="#tools">
                Explore Tools
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>
        </div>

        {/* Tools Grid */}
        <div id="tools" className="mt-20 max-w-6xl mx-auto scroll-mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      {tool.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={`/tools/${tool.id}`}>
                    <Button variant="ghost" className="w-full">
                      Open Tool →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              All processing happens locally in your browser. Your data never leaves your device.
            </p>
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Fast & Offline</h3>
            <p className="text-sm text-muted-foreground">
              No server requests means instant results. Works completely offline.
            </p>
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Simple & Clean</h3>
            <p className="text-sm text-muted-foreground">
              Focused tools with clean interfaces. No distractions, just functionality.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with React Router and shadcn/ui</p>
        </div>
      </footer>
    </div>
  );
}
