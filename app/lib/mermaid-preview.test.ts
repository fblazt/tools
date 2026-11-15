import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  MERMAID_PRESETS,
  getMermaidPreset,
  findMatchingPreset,
  detectMermaidDiagramType,
  computeMermaidStats,
  getMermaidThemeBackground,
  getMermaidThemeVariables,
  extractSvgDimensions,
  renderMermaidDiagram,
  rasterizeSvgToPngBlob,
} from "./mermaid-preview";

const { mockInitialize, mockParse, mockRender } = vi.hoisted(() => ({
  mockInitialize: vi.fn(),
  mockParse: vi.fn(),
  mockRender: vi.fn(),
}));

vi.mock("mermaid", () => ({
  default: {
    initialize: mockInitialize,
    parse: mockParse,
    render: mockRender,
  },
}));

describe("Mermaid Preview Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("Presets", () => {
    it("exports all five starter presets with descriptions and resolves by ID", () => {
      expect(MERMAID_PRESETS).toHaveLength(5);
      expect(getMermaidPreset("flowchart").label).toBe("Flowchart");
      expect(getMermaidPreset("sequence").label).toBe("Sequence");
      expect(getMermaidPreset("er").label).toBe("ER Diagram");
      expect(getMermaidPreset("state").label).toBe("State");
      expect(getMermaidPreset("class").label).toBe("Class");

      for (const preset of MERMAID_PRESETS) {
        expect(preset.description.trim().length).toBeGreaterThan(0);
      }
    });

    it("falls back to flowchart preset for an unknown preset ID", () => {
      // @ts-expect-error testing runtime fallback for invalid preset id
      expect(getMermaidPreset("unknown").id).toBe("flowchart");
    });

    it("matches presets by exact or whitespace-padded source and returns undefined for custom syntax", () => {
      const sequencePreset = getMermaidPreset("sequence");
      const classPreset = getMermaidPreset("class");

      expect(findMatchingPreset(sequencePreset.code)?.id).toBe("sequence");
      expect(findMatchingPreset(`  \n${classPreset.code}\n  `)?.id).toBe("class");
      expect(findMatchingPreset(`${sequencePreset.code}\n  C->>A: Retry`)).toBeUndefined();
      expect(findMatchingPreset("flowchart TD\n  X --> Y")).toBeUndefined();
      expect(findMatchingPreset("   \n  ")).toBeUndefined();
    });
  });

  describe("detectMermaidDiagramType", () => {
    it("returns Empty for blank, whitespace, comment-only, or directive-only input", () => {
      expect(detectMermaidDiagramType("")).toBe("Empty");
      expect(detectMermaidDiagramType("   \n\t  ")).toBe("Empty");
      expect(detectMermaidDiagramType("%% just a comment\n%% another")).toBe("Empty");
      expect(detectMermaidDiagramType('%%{init: {"theme": "base"}}%%')).toBe("Empty");
    });

    it("skips leading blank lines, comments, and multi-line directives before detecting keyword", () => {
      const source = [
        "",
        "%% Leading comment",
        "%%{init: {",
        '  "theme": "dark"',
        "}}%%",
        "  sequenceDiagram  ",
        "  A->>B: Hello",
      ].join("\n");

      expect(detectMermaidDiagramType(source)).toBe("Sequence");
    });

    it("maps all supported Mermaid diagram keywords accurately", () => {
      expect(detectMermaidDiagramType("flowchart LR\n  A --> B")).toBe("Flowchart");
      expect(detectMermaidDiagramType("graph TD\n  A --> B")).toBe("Flowchart");
      expect(detectMermaidDiagramType("sequenceDiagram\n  A->>B: Hi")).toBe("Sequence");
      expect(detectMermaidDiagramType("erDiagram\n  A ||--o{ B : has")).toBe("ER Diagram");
      expect(detectMermaidDiagramType("stateDiagram\n  [*] --> Idle")).toBe("State");
      expect(detectMermaidDiagramType("stateDiagram-v2\n  [*] --> Idle")).toBe("State");
      expect(detectMermaidDiagramType("classDiagram\n  class User")).toBe("Class");
      expect(detectMermaidDiagramType("gantt\n  title Plan")).toBe("Gantt");
      expect(detectMermaidDiagramType("pie title Pets\n  \"Dogs\" : 10")).toBe("Pie");
      expect(detectMermaidDiagramType("gitGraph\n  commit")).toBe("Git Graph");
      expect(detectMermaidDiagramType("mindmap\n  root((Idea))")).toBe("Mindmap");
    });

    it("falls back to Diagram for unrecognized syntax", () => {
      expect(detectMermaidDiagramType("customDiagram\n  alpha -> beta")).toBe("Diagram");
    });
  });

  describe("computeMermaidStats", () => {
    it("returns zeroed stats for empty or whitespace input", () => {
      expect(computeMermaidStats("")).toEqual({
        lineCount: 0,
        nodeCount: 0,
        edgeCount: 0,
        diagramType: "Empty",
      });
      expect(computeMermaidStats("  \n  ")).toEqual({
        lineCount: 0,
        nodeCount: 0,
        edgeCount: 0,
        diagramType: "Empty",
      });
    });

    it("computes accurate stats for the Flowchart preset", () => {
      const stats = computeMermaidStats(getMermaidPreset("flowchart").code);
      expect(stats).toEqual({
        lineCount: 7,
        nodeCount: 7,
        edgeCount: 6,
        diagramType: "Flowchart",
      });
    });

    it("handles flowchart edge operators, standalone nodes, and subgraphs", () => {
      const source = [
        "graph TD",
        "  subgraph Core",
        "    A[Start] --> B[Next]",
        "    B --- C",
        "    C -.-> D",
        "    D ==> E",
        "    F[Standalone]",
        "  end",
      ].join("\n");

      expect(computeMermaidStats(source)).toEqual({
        lineCount: 8,
        nodeCount: 6,
        edgeCount: 4,
        diagramType: "Flowchart",
      });
    });

    it("computes accurate stats for the Sequence preset and actor declarations", () => {
      const presetStats = computeMermaidStats(getMermaidPreset("sequence").code);
      expect(presetStats).toEqual({
        lineCount: 9,
        nodeCount: 3,
        edgeCount: 4,
        diagramType: "Sequence",
      });

      const custom = [
        "sequenceDiagram",
        "  actor U as User",
        "  participant S as Service",
        "  Note right of U: Auth check",
        "  U->S: Request",
        "  S-->U: Response",
      ].join("\n");

      expect(computeMermaidStats(custom)).toEqual({
        lineCount: 6,
        nodeCount: 2,
        edgeCount: 2,
        diagramType: "Sequence",
      });
    });

    it("computes accurate stats for the ER Diagram preset and reverse cardinality", () => {
      const presetStats = computeMermaidStats(getMermaidPreset("er").code);
      expect(presetStats).toEqual({
        lineCount: 18,
        nodeCount: 3,
        edgeCount: 2,
        diagramType: "ER Diagram",
      });

      const custom = [
        "erDiagram",
        "  ORDER }o--|| CUSTOMER : belongs_to",
        "  CUSTOMER {",
        "    uuid id PK",
        "  }",
      ].join("\n");

      expect(computeMermaidStats(custom)).toEqual({
        lineCount: 5,
        nodeCount: 2,
        edgeCount: 1,
        diagramType: "ER Diagram",
      });
    });

    it("computes accurate stats for the State preset", () => {
      const stats = computeMermaidStats(getMermaidPreset("state").code);
      expect(stats).toEqual({
        lineCount: 7,
        nodeCount: 5,
        edgeCount: 6,
        diagramType: "State",
      });
    });

    it("computes accurate stats for the Class preset", () => {
      const stats = computeMermaidStats(getMermaidPreset("class").code);
      expect(stats).toEqual({
        lineCount: 14,
        nodeCount: 3,
        edgeCount: 2,
        diagramType: "Class",
      });
    });
  });

  describe("Theme helpers", () => {
    it("returns brutalist background colors for dark and light mode", () => {
      expect(getMermaidThemeBackground(true)).toBe("#13130E");
      expect(getMermaidThemeBackground(false)).toBe("#F4F4F0");
    });

    it("returns full dark themeVariables palette", () => {
      const vars = getMermaidThemeVariables(true);
      expect(vars.darkMode).toBe("true");
      expect(vars.background).toBe("#13130E");
      expect(vars.primaryColor).toBe("#1D1D16");
      expect(vars.primaryTextColor).toBe("#FBFBF9");
      expect(vars.primaryBorderColor).toBe("#00A6F4");
      expect(vars.lineColor).toBe("#ABAB9C");
      expect(vars.secondaryColor).toBe("#00598A");
      expect(vars.tertiaryColor).toBe("#282828");
      expect(vars.mainBkg).toBe("#1D1D16");
      expect(vars.nodeBorder).toBe("#00A6F4");
      expect(vars.clusterBkg).toBe("#13130E");
      expect(vars.edgeLabelBackground).toBe("#1D1D16");
      expect(vars.actorBkg).toBe("#1D1D16");
      expect(vars.actorBorder).toBe("#00A6F4");
      expect(vars.actorTextColor).toBe("#FBFBF9");
      expect(vars.signalColor).toBe("#ABAB9C");
      expect(vars.signalTextColor).toBe("#FBFBF9");
    });

    it("returns full light themeVariables palette", () => {
      const vars = getMermaidThemeVariables(false);
      expect(vars.darkMode).toBe("false");
      expect(vars.background).toBe("#F4F4F0");
      expect(vars.primaryColor).toBe("#FFFFFF");
      expect(vars.primaryTextColor).toBe("#0C0C09");
      expect(vars.primaryBorderColor).toBe("#0069A8");
      expect(vars.lineColor).toBe("#525243");
      expect(vars.secondaryColor).toBe("#E0F2FE");
      expect(vars.tertiaryColor).toBe("#F4F4F0");
      expect(vars.mainBkg).toBe("#FFFFFF");
      expect(vars.nodeBorder).toBe("#0069A8");
      expect(vars.clusterBkg).toBe("#F4F4F0");
      expect(vars.edgeLabelBackground).toBe("#FFFFFF");
      expect(vars.actorBkg).toBe("#FFFFFF");
      expect(vars.actorBorder).toBe("#0069A8");
      expect(vars.actorTextColor).toBe("#0C0C09");
      expect(vars.signalColor).toBe("#525243");
      expect(vars.signalTextColor).toBe("#0C0C09");
    });
  });

  describe("extractSvgDimensions", () => {
    it("extracts width and height from viewBox even when width is 100%", () => {
      const svg = '<svg viewBox="0 0 920 480" width="100%" height="100%"><rect /></svg>';
      expect(extractSvgDimensions(svg)).toEqual({ width: 920, height: 480 });
    });

    it("supports comma-separated viewBox values", () => {
      const svg = '<svg viewBox="0, 0, 512.5, 256.25"></svg>';
      expect(extractSvgDimensions(svg)).toEqual({ width: 512.5, height: 256.25 });
    });

    it("falls back to numeric width and height attributes when viewBox is absent", () => {
      const svg = '<svg width="720px" height="420px"><g /></svg>';
      expect(extractSvgDimensions(svg)).toEqual({ width: 720, height: 420 });
    });

    it("falls back to 640x360 when dimensions are missing or invalid", () => {
      expect(extractSvgDimensions('<svg width="100%" height="auto"></svg>')).toEqual({
        width: 640,
        height: 360,
      });
      expect(extractSvgDimensions('<svg viewBox="0 0 -10 200"></svg>')).toEqual({
        width: 640,
        height: 360,
      });
      expect(extractSvgDimensions("not an svg")).toEqual({
        width: 640,
        height: 360,
      });
    });
  });

  describe("renderMermaidDiagram", () => {
    it("returns invalid result without calling mermaid when source is empty", async () => {
      const result = await renderMermaidDiagram("preview-1", "   \n  ", true);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("empty");
      expect(result.stats).toEqual({
        lineCount: 0,
        nodeCount: 0,
        edgeCount: 0,
        diagramType: "Empty",
      });
      expect(mockInitialize).not.toHaveBeenCalled();
      expect(mockParse).not.toHaveBeenCalled();
      expect(mockRender).not.toHaveBeenCalled();
    });

    it("initializes mermaid strictly, parses, renders SVG, and extracts dimensions", async () => {
      const svgOutput = '<svg id="diagram-1" viewBox="0 0 840 380" width="100%"><g /></svg>';
      mockParse.mockResolvedValue(true);
      mockRender.mockResolvedValue({ svg: svgOutput });

      const source = "flowchart LR\n  A --> B";
      const result = await renderMermaidDiagram("diagram-1", source, true);

      expect(mockInitialize).toHaveBeenCalledWith({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        themeVariables: getMermaidThemeVariables(true),
        flowchart: { htmlLabels: false },
        fontFamily: "Nunito Sans, Inter, sans-serif",
      });
      expect(mockParse).toHaveBeenCalledWith(source);
      expect(mockRender).toHaveBeenCalledWith("diagram-1", source);

      expect(result.isValid).toBe(true);
      expect(result.svg).toBe(svgOutput);
      expect(result.width).toBe(840);
      expect(result.height).toBe(380);
      expect(result.renderTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeUndefined();
      expect(result.stats).toEqual({
        lineCount: 2,
        nodeCount: 2,
        edgeCount: 1,
        diagramType: "Flowchart",
      });
    });

    it("wraps syntax parse errors cleanly without throwing", async () => {
      mockParse.mockRejectedValue(new Error("Syntax error in text: Parse error on line 2"));

      const result = await renderMermaidDiagram("diagram-err", "flowchart LR\n  A -->", false);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Syntax error in text: Parse error on line 2");
      expect(result.svg).toBeUndefined();
      expect(result.stats.diagramType).toBe("Flowchart");
      expect(mockRender).not.toHaveBeenCalled();
    });

    it("wraps non-Error throwables gracefully", async () => {
      mockParse.mockResolvedValue(true);
      mockRender.mockRejectedValue("Unexpected string failure");

      const result = await renderMermaidDiagram("diagram-err-2", "flowchart LR\n  A --> B", false);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Failed to render Mermaid diagram.");
    });
  });

  describe("rasterizeSvgToPngBlob", () => {
    it("normalizes SVG dimensions, fills background before drawImage, and resolves a PNG blob", async () => {
      let capturedSrc = "";
      class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        set src(value: string) {
          capturedSrc = value;
          queueMicrotask(() => {
            this.onload?.();
          });
        }
      }
      vi.stubGlobal("Image", MockImage);

      const callOrder: string[] = [];
      const mockCtx = {
        fillStyle: "",
        fillRect: vi.fn(() => callOrder.push("fillRect")),
        drawImage: vi.fn(() => callOrder.push("drawImage")),
      };
      const expectedBlob = new Blob(["png-bytes"], { type: "image/png" });
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((cb: (blob: Blob | null) => void) => cb(expectedBlob)),
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
        if (tagName === "canvas") {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tagName);
      }) as typeof document.createElement);

      const svg = '<svg viewBox="0 0 400 200" width="100%" height="100%"><rect /></svg>';
      const blob = await rasterizeSvgToPngBlob(svg, {
        scale: 3,
        backgroundColor: "#13130E",
      });

      expect(blob).toBe(expectedBlob);
      expect(capturedSrc.startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
      const decodedSvg = decodeURIComponent(capturedSrc.replace("data:image/svg+xml;charset=utf-8,", ""));
      expect(decodedSvg).toContain('width="400"');
      expect(decodedSvg).toContain('height="200"');
      expect(decodedSvg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(decodedSvg).not.toContain('width="100%"');

      expect(mockCanvas.width).toBe(1200);
      expect(mockCanvas.height).toBe(600);
      expect(mockCtx.fillStyle).toBe("#13130E");
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1200, 600);
      expect(mockCtx.drawImage).toHaveBeenCalledWith(expect.any(MockImage), 0, 0, 1200, 600);
      expect(callOrder).toEqual(["fillRect", "drawImage"]);
      expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), "image/png");
    });

    it("uses default scale of 2 and skips fillRect when backgroundColor is omitted", async () => {
      class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          queueMicrotask(() => this.onload?.());
        }
      }
      vi.stubGlobal("Image", MockImage);

      const mockCtx = {
        fillStyle: "",
        fillRect: vi.fn(),
        drawImage: vi.fn(),
      };
      const expectedBlob = new Blob(["png"], { type: "image/png" });
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((cb: (blob: Blob | null) => void) => cb(expectedBlob)),
      };
      vi.spyOn(document, "createElement").mockReturnValue(mockCanvas as unknown as HTMLCanvasElement);

      const blob = await rasterizeSvgToPngBlob('<svg viewBox="0 0 300 150"></svg>');

      expect(blob).toBe(expectedBlob);
      expect(mockCanvas.width).toBe(600);
      expect(mockCanvas.height).toBe(300);
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
      expect(mockCtx.drawImage).toHaveBeenCalledOnce();
    });

    it("rejects on invalid SVG, image load failure, missing 2D context, or null blob", async () => {
      await expect(rasterizeSvgToPngBlob("<div>not svg</div>")).rejects.toThrow("Invalid SVG markup");

      class ErrorImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          queueMicrotask(() => this.onerror?.());
        }
      }
      vi.stubGlobal("Image", ErrorImage);
      await expect(rasterizeSvgToPngBlob('<svg viewBox="0 0 100 100"></svg>')).rejects.toThrow(
        "Failed to load SVG into image",
      );

      class OkImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          queueMicrotask(() => this.onload?.());
        }
      }
      vi.stubGlobal("Image", OkImage);
      vi.spyOn(document, "createElement").mockReturnValue({
        width: 0,
        height: 0,
        getContext: vi.fn(() => null),
      } as unknown as HTMLCanvasElement);

      await expect(rasterizeSvgToPngBlob('<svg viewBox="0 0 100 100"></svg>')).rejects.toThrow(
        "Canvas 2D context is unavailable",
      );

      vi.spyOn(document, "createElement").mockReturnValue({
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({ drawImage: vi.fn() })),
        toBlob: vi.fn((cb: (blob: Blob | null) => void) => cb(null)),
      } as unknown as HTMLCanvasElement);

      await expect(rasterizeSvgToPngBlob('<svg viewBox="0 0 100 100"></svg>')).rejects.toThrow(
        "Failed to encode PNG blob",
      );
    });
  });
});
