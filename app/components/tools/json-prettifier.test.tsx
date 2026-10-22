import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { JsonPrettifier } from "~/components/tools/json-prettifier";

describe("JsonPrettifier", () => {
  const writeTextMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders default view with input, output, and toolbar buttons", () => {
    render(<JsonPrettifier />);

    expect(screen.getByText("Input")).toBeInTheDocument();
    expect(screen.getByText("Output")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sample" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fold All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unfold" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();

    expect(
      screen.getByText("Enter or paste JSON on the left to inspect and format.")
    ).toBeInTheDocument();
  });

  it("loads sample JSON and displays formatted tree view and diagnostics stats", () => {
    render(<JsonPrettifier />);

    fireEvent.click(screen.getByRole("button", { name: "Sample" }));

    // Check Textarea value
    const textarea = screen.getByPlaceholderText("Paste JSON here...") as HTMLTextAreaElement;
    expect(textarea.value).toContain("Alex Vance");

    // Check Tree View content
    const treeView = screen.getByTestId("json-tree-view");
    expect(within(treeView).getByText(/"user"/)).toBeInTheDocument();
    expect(within(treeView).getByText(/"Alex Vance"/)).toBeInTheDocument();

    // Check Diagnostics Stats Footer
    expect(screen.getByText(/Raw:/)).toBeInTheDocument();
    expect(screen.getByText(/Formatted:/)).toBeInTheDocument();
    expect(screen.getByText(/Minified:/)).toBeInTheDocument();
    expect(screen.getByText(/Lines:/)).toBeInTheDocument();
    expect(screen.getByText(/Depth:/)).toBeInTheDocument();
    expect(screen.getByText(/Keys:/)).toBeInTheDocument();
    expect(screen.getByText(/Saved:/)).toBeInTheDocument();
  });

  it("clears input and output when Clear is clicked", () => {
    render(<JsonPrettifier />);

    fireEvent.click(screen.getByRole("button", { name: "Sample" }));
    const treeView = screen.getByTestId("json-tree-view");
    expect(within(treeView).getByText(/"Alex Vance"/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    const textarea = screen.getByPlaceholderText("Paste JSON here...") as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
    expect(
      screen.getByText("Enter or paste JSON on the left to inspect and format.")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("json-tree-view")).not.toBeInTheDocument();
  });

  it("changes indentation between 2 and 4", () => {
    render(<JsonPrettifier />);

    fireEvent.click(screen.getByRole("button", { name: "Sample" }));

    const btn2 = screen.getByRole("button", { name: "2" });
    const btn4 = screen.getByRole("button", { name: "4" });

    fireEvent.click(btn4);
    // Tree view still renders properly with indent 4
    const treeView = screen.getByTestId("json-tree-view");
    expect(within(treeView).getByText(/"user"/)).toBeInTheDocument();

    fireEvent.click(btn2);
    expect(within(treeView).getByText(/"user"/)).toBeInTheDocument();
  });

  it("displays syntax error banner on invalid JSON", () => {
    render(<JsonPrettifier />);

    const textarea = screen.getByPlaceholderText("Paste JSON here...");
    fireEvent.change(textarea, { target: { value: '{\n  "broken": \n}' } });

    expect(screen.getByText("Syntax Error:")).toBeInTheDocument();
    expect(screen.getByText(/Line/i)).toBeInTheDocument();

    // Copy and Save buttons should be disabled
    expect(screen.getByRole("button", { name: /copy/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("collapses and expands a block using fold caret and chip", () => {
    render(<JsonPrettifier />);

    fireEvent.click(screen.getByRole("button", { name: "Sample" }));
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

    fireEvent.click(screen.getByRole("button", { name: "Sample" }));
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

    fireEvent.click(screen.getByRole("button", { name: "Sample" }));

    const copyBtn = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining("Alex Vance"));

    // Feedback displayed
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });
});
