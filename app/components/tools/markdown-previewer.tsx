import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

const sampleMarkdown = `# Welcome to Markdown Previewer

## Features
- **Bold text** and *italic text*
- \`Inline code\` and code blocks
- [Links](https://example.com)
- Lists and checkboxes

## Code Example
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

## Task List
- [x] Completed task
- [ ] Pending task

> Blockquotes are supported
> 
> Even nested ones!

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

---

### Try it out!
Edit the markdown on the left and see the live preview on the right.`;

export function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState(sampleMarkdown);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearMarkdown = () => {
    setMarkdown("");
  };

  const loadSample = () => {
    setMarkdown(sampleMarkdown);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "markdown.md";
    link.click();
    URL.revokeObjectURL(url);
  };



  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Markdown Previewer</h1>
        <p className="text-muted-foreground">
          Preview your markdown in real-time. All processing happens client-side - no data is sent to any server.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
          <CardDescription>Manage your markdown content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={loadSample} variant="outline" size="sm">
              Load Sample
            </Button>
            <Button onClick={clearMarkdown} variant="outline" size="sm">
              Clear
            </Button>
            <Button onClick={downloadMarkdown} variant="outline" size="sm">
              Download MD
            </Button>

          </div>
        </CardContent>
      </Card>

      {/* Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Markdown Editor
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(markdown)}
              >
                Copy
              </Button>
            </CardTitle>
            <CardDescription>Write your markdown here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="markdown-input">Markdown Content</Label>
              <div className="relative">
                <Textarea
                  id="markdown-input"
                  className="h-[600px] font-mono text-sm resize-none"
                  placeholder="Enter your markdown here..."
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  spellCheck={false}
                />

              </div>
              <p className="text-xs text-muted-foreground">
                Supports GitHub Flavored Markdown (GFM) including tables, task lists, and more.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Live Preview
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const htmlContent = document.getElementById("markdown-preview")?.innerHTML;
                  if (htmlContent) {
                    copyToClipboard(htmlContent);
                  }
                }}
              >
                Copy HTML
              </Button>
            </CardTitle>
            <CardDescription>Rendered markdown output</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              id="markdown-preview"
              className="h-[600px] p-4 border rounded-md overflow-auto bg-muted/30 prose prose-sm max-w-none dark:prose-invert [&_p:not(:last-child)]:mb-4 [&_h1:not(:last-child)]:mb-4 [&_h2:not(:last-child)]:mb-3 [&_h3:not(:last-child)]:mb-2 [&_ul:not(:last-child)]:mb-4 [&_ol:not(:last-child)]:mb-4 [&_blockquote:not(:last-child)]:mb-4 [&_pre:not(:last-child)]:mb-4 [&_table:not(:last-child)]:mb-4"
            >
              {markdown ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown}
                </ReactMarkdown>
              ) : (
                <div className="text-muted-foreground text-center mt-8">
                  <p>Your markdown preview will appear here</p>
                  <p className="text-sm mt-2">Start typing in the editor to see the live preview</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Markdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Markdown is a lightweight markup language that allows you to format text using simple, 
            readable syntax. It's commonly used for documentation, README files, and content creation.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Supported Features:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Text formatting:</strong> Bold, italic, strikethrough</li>
              <li><strong>Headings:</strong> H1 through H6 levels</li>
              <li><strong>Links and images:</strong> Inline and reference style</li>
              <li><strong>Code:</strong> Inline code and fenced code blocks with syntax highlighting</li>
              <li><strong>Lists:</strong> Ordered, unordered, and task lists</li>
              <li><strong>Tables:</strong> GitHub-style tables</li>
              <li><strong>Blockquotes:</strong> Including nested blockquotes</li>
              <li><strong>Horizontal rules:</strong> Section dividers</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Quick Reference:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <code># Heading 1</code> → <span className="text-foreground">Large heading</span>
              </div>
              <div>
                <code>**bold**</code> → <span className="font-bold">bold text</span>
              </div>
              <div>
                <code>*italic*</code> → <span className="italic">italic text</span>
              </div>
              <div>
                <code>[text](url)</code> → <span className="text-blue-600">link</span>
              </div>
              <div>
                <code>\`code\`</code> → <code>inline code</code>
              </div>
              <div>
                <code>- [x] task</code> → <span>☑ completed task</span>
              </div>
            </div>
          </div>
          <p className="text-xs italic">
            All markdown processing is performed locally in your browser using react-markdown and remark-gfm.
            No data is transmitted to external servers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}