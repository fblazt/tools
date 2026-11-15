import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "~/components/theme-provider";
import { MermaidPreview } from "~/components/tools/mermaid-preview";
import * as mermaidLib from "~/lib/mermaid-preview";

vi.mock("~/lib/mermaid-preview", async () => {
  const actual = await vi.importActual<typeof import("~/lib/mermaid-preview")>("~/lib/mermaid-preview");
  return {
    ...actual,
    renderMermaidDiagram: vi.fn(),
    rasterizeSvgToPngBlob: vi.fn(),
  };
});

const renderMermaidDiagramMock = vi.mocked(mermaidLib.renderMermaidDiagram);
const rasterizeSvgToPngBlobMock = vi.mocked(mermaidLib.rasterizeSvgToPngBlob);

function createValidResult(source: string, width = 480, height = 240, renderTimeMs = 12): mermaidLib.MermaidRenderResult {
  const stats = mermaidLib.computeMermaidStats(source);
  return {
    isValid: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><g><text>${stats.diagramType}</text></g></svg>`,
    width,
    height,
    renderTimeMs,
    stats,
  };
}

function renderWithTheme(defaultTheme: "dark" | "light" | "system" = "dark") {
  return render(
    <ThemeProvider defaultTheme={defaultTheme}>
      <MermaidPreview />
    </ThemeProvider>
  );
}

describe("MermaidPreview", () => {
  const writeTextMock = vi.fn();
  const readTextMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
        readText: readTextMock,
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, "matchMedia", {
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("dark"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
      writable: true,
      configurable: true,
    });

    renderMermaidDiagramMock.mockImplementation(async (_id, source) => createValidResult(source));
    rasterizeSvgToPngBlobMock.mockResolvedValue(new Blob(["png-bytes"], { type: "image/png" }));
  });

  it("renders 1:2 desktop layout grid and initial Flowchart preset", async () => {
    renderWithTheme("dark");

    const grid = screen.getByTestId("mermaid-workspace-grid");
    expect(grid.className).toContain("lg:grid-cols-3");
    expect(screen.getByTestId("syntax-card").className).toContain("lg:col-span-1");
    expect(screen.getByTestId("preview-card").className).toContain("lg:col-span-2");

    const toolbar = screen.getByTestId("mermaid-toolbar");
    expect(within(toolbar).getByText("Preset:")).toBeInTheDocument();
    expect(within(toolbar).getByRole("button", { name: "Flowchart" })).toHaveAttribute("aria-pressed", "true");
    expect(within(toolbar).getByRole("button", { name: "Sequence" })).toHaveAttribute("aria-pressed", "false");
    expect(within(toolbar).getByRole("button", { name: "ER" })).toHaveAttribute("aria-pressed", "false");
    expect(within(toolbar).getByRole("button", { name: "State" })).toHaveAttribute("aria-pressed", "false");

    const editor = screen.getByLabelText("Mermaid syntax input") as HTMLTextAreaElement;
    expect(editor.value).toContain("Client Request");

    await waitFor(() => {
      expect(screen.getByTestId("syntax-status-badge")).toHaveTextContent("Valid Flowchart");
    });

    expect(screen.getByTestId("preview-dimensions-badge")).toHaveTextContent("SVG • 480×240");
    expect(screen.getByTestId("preview-status-text")).toHaveTextContent("Rendered locally in 12ms");
    expect(screen.getByTestId("syntax-footer-stats")).toHaveTextContent(/Lines:\s*7.*Nodes:\s*7.*Edges:\s*6/);

    const gutter = screen.getByTestId("syntax-line-gutter");
    expect(within(gutter).getByText("1")).toBeInTheDocument();
    expect(within(gutter).getByText("7")).toBeInTheDocument();
  });

  it("switches presets, resets pan/zoom, and supports Clear and Sample restoration", async () => {
    renderWithTheme("dark");

    await waitFor(() => {
      expect(screen.getByTestId("syntax-status-badge")).toHaveTextContent("Valid Flowchart");
    });

    // Zoom in first so we verify preset switch resets zoom back to 100%
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByRole("button", { name: "Reset zoom" })).toHaveTextContent("125%");

    fireEvent.click(screen.getByRole("button", { name: "ER" }));
    const editor = screen.getByLabelText("Mermaid syntax input") as HTMLTextAreaElement;
    expect(editor.value).toContain("erDiagram");
    expect(screen.getByRole("button", { name: "ER" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Reset zoom" })).toHaveTextContent("100%");

    await waitFor(() => {
      expect(screen.getByTestId("syntax-status-badge")).toHaveTextContent("Valid ER Diagram");
    });

    // Clear editor
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(editor.value).toBe("");
    expect(screen.getByTestId("syntax-status-badge")).toHaveTextContent("Empty");
    expect(screen.getByText(/Enter Mermaid syntax on the left/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^SVG$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^PNG$/i })).toBeDisabled();

    // Sample restores the active preset (ER)
    fireEvent.click(screen.getByRole("button", { name: /sample/i }));
    expect(editor.value).toContain("erDiagram");
    await waitFor(() => {
      expect(screen.getByTestId("syntax-status-badge")).toHaveTextContent("Valid ER Diagram");
    });
  });

  it("displays Invalid Syntax badge and accessible error alert when syntax fails", async () => {
    renderWithTheme("dark");

    await waitFor(() => {
      expect(screen.getByTestId("syntax-status-badge")).toHaveTextContent("Valid Flowchart");
    });

    renderMermaidDiagramMock.mockResolvedValueOnce({
      isValid: false,
      error: "Parse error on line 2: unexpected token",
      stats: { lineCount: 2, nodeCount: 0, edgeCount: 0, diagramType: "Flowchart" },
    });

    const editor = screen.getByLabelText("Mermaid syntax input");
    fireEvent.change(editor, { target: { value: "flowchart LR\n  A -->>" } });

    await waitFor(() => {
      expect(screen.getByTestId("syntax-status-badge")).toHaveTextContent("Invalid Syntax");
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Syntax Error");
    expect(alert).toHaveTextContent("Parse error on line 2: unexpected token");
    expect(screen.getByTestId("preview-status-text")).toHaveTextContent("Invalid syntax");
    expect(screen.getByRole("button", { name: /^SVG$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^PNG$/i })).toBeDisabled();
  });

  it("supports Copy and Paste actions via clipboard", async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    readTextMock.mockResolvedValueOnce("stateDiagram-v2\n  [*] --> Active");

    renderWithTheme("dark");

    const copyBtn = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining("Client Request"));
    expect(await screen.findByText("Copied")).toBeInTheDocument();

    const pasteBtn = screen.getByRole("button", { name: /paste/i });
    fireEvent.click(pasteBtn);

    await waitFor(() => {
      const editor = screen.getByLabelText("Mermaid syntax input") as HTMLTextAreaElement;
      expect(editor.value).toBe("stateDiagram-v2\n  [*] --> Active");
    });

    await waitFor(() => {
      expect(screen.getByTestId("syntax-status-badge")).toHaveTextContent("Valid State");
    });
  });

  it("controls zoom with +, -, reset, and Fit buttons", async () => {
    renderWithTheme("dark");

    await waitFor(() => {
      expect(screen.getByTestId("preview-transform-wrapper")).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole("button", { name: "Reset zoom" });
    expect(resetBtn).toHaveTextContent("100%");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(resetBtn).toHaveTextContent("125%");
    expect(screen.getByTestId("preview-transform-wrapper")).toHaveStyle({
      transform: "translate(0px, 0px) scale(1.25)",
    });

    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(resetBtn).toHaveTextContent("100%");

    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(resetBtn).toHaveTextContent("75%");

    fireEvent.click(resetBtn);
    expect(resetBtn).toHaveTextContent("100%");

    // Fit resets pan/zoom cleanly even when layout box is 0x0 in jsdom
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: /fit/i }));
    expect(resetBtn).toHaveTextContent("100%");
  });

  it("preserves native pixel SVG host sizing, fits wide diagrams accurately, and zooms up to 800%", async () => {
    renderMermaidDiagramMock.mockImplementation(async (_id, source) =>
      createValidResult(source, 1933, 851, 14)
    );

    renderWithTheme("dark");

    const wrapper = await screen.findByTestId("preview-transform-wrapper");
    expect(wrapper.className).toContain("shrink-0");

    const svgHost = screen.getByTestId("preview-svg-host");
    expect(svgHost).toHaveStyle({ width: "1933px", height: "851px" });

    const viewport = screen.getByTestId("preview-viewport");
    Object.defineProperty(viewport, "clientWidth", { value: 950, configurable: true });
    Object.defineProperty(viewport, "clientHeight", { value: 460, configurable: true });

    const resetBtn = screen.getByRole("button", { name: "Reset zoom" });
    fireEvent.click(screen.getByRole("button", { name: /fit/i }));
    expect(resetBtn).toHaveTextContent("47%");
    expect(wrapper).toHaveStyle({ transform: "translate(0px, 0px) scale(0.47)" });

    // Reset to 100% and step through adaptive zoom increments up to 800%
    fireEvent.click(resetBtn);
    expect(resetBtn).toHaveTextContent("100%");

    const zoomInBtn = screen.getByRole("button", { name: "Zoom in" });
    const expectedZoomSteps = [
      "125%",
      "150%",
      "175%",
      "200%",
      "250%",
      "300%",
      "350%",
      "400%",
      "500%",
      "600%",
      "700%",
      "800%",
    ];

    for (const label of expectedZoomSteps) {
      fireEvent.click(zoomInBtn);
      expect(resetBtn).toHaveTextContent(label);
    }

    expect(wrapper).toHaveStyle({ transform: "translate(0px, 0px) scale(8)" });
    expect(zoomInBtn).toBeDisabled();
  });

  it("downloads SVG and PNG with dark theme background (#13130E)", async () => {
    const createObjectURLMock = vi.fn().mockReturnValue("blob:mermaid-export");
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    const originalCreateElement = document.createElement.bind(document);
    const createdLinks: HTMLAnchorElement[] = [];
    const clickMock = vi.fn();

    vi.spyOn(document, "createElement").mockImplementation(((tagName: string, options?: ElementCreationOptions) => {
      const el = originalCreateElement(tagName, options);
      if (tagName === "a") {
        el.click = clickMock;
        createdLinks.push(el as HTMLAnchorElement);
      }
      return el;
    }) as typeof document.createElement);

    renderWithTheme("dark");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^SVG$/i })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /^SVG$/i }));
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    const svgBlob = createObjectURLMock.mock.calls[0][0] as Blob;
    expect(svgBlob.type).toBe("image/svg+xml;charset=utf-8");
    expect(createdLinks[0].download).toBe("mermaid-flowchart.svg");
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:mermaid-export");

    fireEvent.click(screen.getByRole("button", { name: /^PNG$/i }));

    await waitFor(() => {
      expect(rasterizeSvgToPngBlobMock).toHaveBeenCalledWith(
        expect.stringContaining("<svg"),
        expect.objectContaining({ scale: 2, backgroundColor: "#13130E" })
      );
    });
    expect(createdLinks[1].download).toBe("mermaid-flowchart.png");
    expect(clickMock).toHaveBeenCalledTimes(2);
  });

  it("downloads PNG with light theme background (#F4F4F0) when light theme is active", async () => {
    const createObjectURLMock = vi.fn().mockReturnValue("blob:mermaid-light-png");
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    renderWithTheme("light");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^PNG$/i })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /^PNG$/i }));

    await waitFor(() => {
      expect(rasterizeSvgToPngBlobMock).toHaveBeenCalledWith(
        expect.stringContaining("<svg"),
        expect.objectContaining({ scale: 2, backgroundColor: "#F4F4F0" })
      );
    });
  });

  it("ignores stale async render responses when source changes rapidly", async () => {
    let resolveFirst!: (value: mermaidLib.MermaidRenderResult) => void;
    const firstPromise = new Promise<mermaidLib.MermaidRenderResult>((resolve) => {
      resolveFirst = resolve;
    });

    renderMermaidDiagramMock
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce(createValidResult("sequenceDiagram\n  A->>B: Hi", 320, 180, 9));

    renderWithTheme("dark");

    fireEvent.click(screen.getByRole("button", { name: "Sequence" }));

    await waitFor(() => {
      expect(screen.getByTestId("preview-dimensions-badge")).toHaveTextContent("SVG • 320×180");
    });

    // Resolve the stale first request AFTER Sequence already rendered
    resolveFirst(createValidResult(mermaidLib.MERMAID_PRESETS[0].code, 999, 999, 55));

    await waitFor(() => {
      expect(screen.getByTestId("preview-dimensions-badge")).toHaveTextContent("SVG • 320×180");
      expect(screen.getByTestId("syntax-status-badge")).toHaveTextContent("Valid Sequence");
    });
  });
});
