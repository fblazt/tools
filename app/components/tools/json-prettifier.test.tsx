import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { JsonPrettifier } from "~/components/tools/json-prettifier";

describe("JsonPrettifier", () => {
  const writeTextMock = vi.fn();
  const readTextMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
        readText: readTextMock,
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders default layout with prettifier-toolbar, input card, output card, and footers", () => {
    render(<JsonPrettifier />);

    // Assert prettifier-toolbar exists with Indent:, 2, 4, Sample, Clear
    const toolbar = screen.getByTestId("prettifier-toolbar");
    expect(toolbar).toBeInTheDocument();
    expect(within(toolbar).getByText("Indent:")).toBeInTheDocument();
    expect(within(toolbar).getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(within(toolbar).getByRole("button", { name: "4" })).toBeInTheDocument();
    expect(within(toolbar).getByRole("button", { name: /sample/i })).toBeInTheDocument();
    expect(within(toolbar).getByRole("button", { name: /clear/i })).toBeInTheDocument();

    // Headers
    expect(screen.getByText("Input")).toBeInTheDocument();
    expect(screen.getByText("Output")).toBeInTheDocument();

    // Output header actions
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fold All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unfold" })).toBeInTheDocument();

    // Status badge is not rendered when empty
    expect(screen.queryByTestId("input-status-badge")).not.toBeInTheDocument();

    // Assert input-footer displays stats and Paste button
    const inputFooter = screen.getByTestId("input-footer");
    expect(inputFooter).toBeInTheDocument();
    expect(screen.getByTestId("input-footer-stats")).toHaveTextContent(/Lines:\s*0.*Chars:\s*0.*0\s*B/);
    expect(within(inputFooter).getByRole("button", { name: /paste/i })).toBeInTheDocument();

    // Assert output-footer displays output-stats-left and output-stats-right
    const outputFooter = screen.getByTestId("output-footer");
    expect(outputFooter).toBeInTheDocument();
    expect(screen.getByTestId("output-stats-left")).toBeInTheDocument();
    expect(screen.getByTestId("output-stats-right")).toBeInTheDocument();

    // Initial output empty state
    expect(
      screen.getByText("Enter or paste JSON on the left to inspect and format.")
    ).toBeInTheDocument();
  });

  it("loads sample JSON and displays input status badge, formatted tree view, gutter, and footer diagnostics", () => {
    render(<JsonPrettifier />);

    fireEvent.click(screen.getByRole("button", { name: /sample/i }));

    // Assert input-status-badge displays "Valid JSON"
    const statusBadge = screen.getByTestId("input-status-badge");
    expect(statusBadge).toHaveTextContent("Valid JSON");

    // Input footer stats update
    expect(screen.getByTestId("input-footer-stats")).toHaveTextContent(/Lines:\s*\d+.*Chars:\s*\d+.*\d+\s*B/);

    // Assert line numbers gutter exists and renders line numbers
    const gutter = screen.getByTestId("line-gutter");
    expect(gutter).toBeInTheDocument();
    expect(within(gutter).getByText("1")).toBeInTheDocument();
    expect(within(gutter).getByText("2")).toBeInTheDocument();

    // Tree View content
    const treeView = screen.getByTestId("json-tree-view");
    expect(within(treeView).getByText(/"user"/)).toBeInTheDocument();
    expect(within(treeView).getByText(/"Alex Vance"/)).toBeInTheDocument();

    // Output stats left and right
    const statsLeft = screen.getByTestId("output-stats-left");
    expect(statsLeft).toHaveTextContent(/Formatted:\s*\d+\s*B/);
    expect(statsLeft).toHaveTextContent(/Lines:\s*\d+/);
    expect(statsLeft).toHaveTextContent(/Depth:\s*\d+/);
    expect(statsLeft).toHaveTextContent(/Keys:\s*\d+/);

    const statsRight = screen.getByTestId("output-stats-right");
    expect(statsRight).toHaveTextContent(/Minified:\s*\d+\s*B\s*\(-?\d+%\)/);
  });

  it("clears input and output when Clear is clicked", () => {
    render(<JsonPrettifier />);

    fireEvent.click(screen.getByRole("button", { name: /sample/i }));
    expect(screen.getByTestId("input-status-badge")).toBeInTheDocument();
    expect(screen.getByTestId("json-tree-view")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));

    const textarea = screen.getByPlaceholderText("Paste JSON here...") as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
    expect(screen.queryByTestId("input-status-badge")).not.toBeInTheDocument();
    expect(
      screen.getByText("Enter or paste JSON on the left to inspect and format.")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("json-tree-view")).not.toBeInTheDocument();
  });

  it("pastes JSON from clipboard via Paste button", async () => {
    readTextMock.mockResolvedValueOnce('{"pasted": true}');
    render(<JsonPrettifier />);

    const pasteBtn = screen.getByRole("button", { name: /paste/i });
    fireEvent.click(pasteBtn);

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText("Paste JSON here...") as HTMLTextAreaElement;
      expect(textarea.value).toBe('{"pasted": true}');
    });

    expect(screen.getByTestId("input-status-badge")).toHaveTextContent("Valid JSON");
  });

  it("changes indentation between 2 and 4", () => {
    render(<JsonPrettifier />);

    fireEvent.click(screen.getByRole("button", { name: /sample/i }));

    const btn2 = screen.getByRole("button", { name: "2" });
    const btn4 = screen.getByRole("button", { name: "4" });

    fireEvent.click(btn4);
    expect(btn4.className).toContain("bg-sky-600");
    const treeView = screen.getByTestId("json-tree-view");
    expect(within(treeView).getByText(/"user"/)).toBeInTheDocument();

    fireEvent.click(btn2);
    expect(btn2.className).toContain("bg-sky-600");
    expect(within(treeView).getByText(/"user"/)).toBeInTheDocument();
  });

  it("displays invalid JSON badge and syntax error banner on broken input", () => {
    render(<JsonPrettifier />);

    const textarea = screen.getByPlaceholderText("Paste JSON here...");
    fireEvent.change(textarea, { target: { value: '{\n  "broken": \n}' } });

    const statusBadge = screen.getByTestId("input-status-badge");
    expect(statusBadge).toHaveTextContent("Invalid JSON");

    expect(screen.getByText("Syntax Error:")).toBeInTheDocument();
    expect(screen.getByText(/Line \d+, Column \d+/)).toBeInTheDocument();

    // Copy and Save buttons should be disabled
    expect(screen.getByRole("button", { name: /copy/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("collapses and expands a block using fold caret and chip", () => {
    render(<JsonPrettifier />);

    fireEvent.click(screen.getByRole("button", { name: /sample/i }));
    const treeView = screen.getByTestId("json-tree-view");
    expect(within(treeView).getByText(/"Alex Vance"/)).toBeInTheDocument();

    // Find caret for user object
    const userCaret = screen.getByTestId("caret-root.user");
    fireEvent.click(userCaret);

    // After collapsing user, Alex Vance should no longer be visible in the tree
    expect(within(treeView).queryByText(/"Alex Vance"/)).not.toBeInTheDocument();

    // Chip should be displayed
    const chip = within(treeView).getByRole("button", { name: /Unfold user/i });
    expect(chip).toBeInTheDocument();

    // Click chip to unfold
    fireEvent.click(chip);
    expect(within(treeView).getByText(/"Alex Vance"/)).toBeInTheDocument();
  });

  it("folds all and unfolds all blocks with toolbar buttons", () => {
    render(<JsonPrettifier />);

    fireEvent.click(screen.getByRole("button", { name: /sample/i }));
    const treeView = screen.getByTestId("json-tree-view");
    expect(within(treeView).getByText(/"Alex Vance"/)).toBeInTheDocument();

    // Click Fold All
    fireEvent.click(screen.getByRole("button", { name: "Fold All" }));

    // All blocks folded, so Alex Vance is not visible in tree view
    expect(within(treeView).queryByText(/"Alex Vance"/)).not.toBeInTheDocument();

    // Click Unfold
    fireEvent.click(screen.getByRole("button", { name: "Unfold" }));

    // Alex Vance should be visible again
    expect(within(treeView).getByText(/"Alex Vance"/)).toBeInTheDocument();
  });

  it("copies formatted JSON to clipboard with feedback", async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    render(<JsonPrettifier />);

    fireEvent.click(screen.getByRole("button", { name: /sample/i }));

    const copyBtn = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining("Alex Vance"));

    // Feedback displayed
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("saves formatted JSON file via blob link download", () => {
    const createObjectURLMock = vi.fn().mockReturnValue("blob:formatted-test");
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    const originalCreateElement = document.createElement.bind(document);
    const clickMock = vi.fn();
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string, options?: any) => {
      const el = originalCreateElement(tagName, options);
      if (tagName === "a") {
        el.click = clickMock;
      }
      return el;
    }) as any);

    render(<JsonPrettifier />);
    fireEvent.click(screen.getByRole("button", { name: /sample/i }));

    const saveBtn = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveBtn);

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:formatted-test");
  });
});
