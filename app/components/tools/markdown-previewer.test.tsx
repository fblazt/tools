import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarkdownPreviewer } from "~/components/tools/markdown-previewer";

// Mock clipboard before each test
const mockClipboard = {
  writeText: vi.fn(),
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
  configurable: true,
});

describe("MarkdownPreviewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default values", () => {
    render(<MarkdownPreviewer />);
    
    expect(screen.getByText("Markdown Previewer")).toBeInTheDocument();
    expect(screen.getByLabelText("Markdown Content")).toBeInTheDocument();
    expect(screen.getByText("Load Sample")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
    expect(screen.getByText("Download MD")).toBeInTheDocument();
  });

  it("displays sample markdown by default", () => {
    render(<MarkdownPreviewer />);
    
    const textarea = screen.getByLabelText("Markdown Content") as HTMLTextAreaElement;
    expect(textarea.value).toContain("# Welcome to Markdown Previewer");
    
    // Check that preview contains rendered content
    expect(screen.getByText("Welcome to Markdown Previewer")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
  });

  it("shows placeholder message when editor is empty", async () => {
    const user = userEvent.setup();
    
    render(<MarkdownPreviewer />);
    
    const textarea = screen.getByLabelText("Markdown Content") as HTMLTextAreaElement;
    await user.clear(textarea);
    
    expect(screen.getByText("Your markdown preview will appear here")).toBeInTheDocument();
    expect(screen.getByText("Start typing in the editor to see the live preview")).toBeInTheDocument();
  });

  it("clears content when clicking Clear", async () => {
    const user = userEvent.setup();
    
    render(<MarkdownPreviewer />);
    
    const clearButton = screen.getByText("Clear");
    await user.click(clearButton);
    
    const textarea = screen.getByLabelText("Markdown Content") as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
    expect(screen.getByText("Your markdown preview will appear here")).toBeInTheDocument();
  });



  it("loads sample content when clicking Load Sample", async () => {
    const user = userEvent.setup();
    
    render(<MarkdownPreviewer />);
    
    const textarea = screen.getByLabelText("Markdown Content") as HTMLTextAreaElement;
    await user.clear(textarea);
    
    const loadSampleButton = screen.getByText("Load Sample");
    await user.click(loadSampleButton);
    
    expect(textarea.value).toContain("# Welcome to Markdown Previewer");
    expect(screen.getByText("Welcome to Markdown Previewer")).toBeInTheDocument();
  });

  it("updates preview when typing in editor", async () => {
    const user = userEvent.setup();
    
    render(<MarkdownPreviewer />);
    
    const textarea = screen.getByLabelText("Markdown Content") as HTMLTextAreaElement;
    await user.clear(textarea);
    await user.type(textarea, "# New Heading\n\nThis is **bold** text.");
    
    expect(screen.getByText("New Heading")).toBeInTheDocument();
    expect(screen.getByText("bold")).toBeInTheDocument();
  });

  it("displays information about markdown", () => {
    render(<MarkdownPreviewer />);
    
    expect(screen.getByText("About Markdown")).toBeInTheDocument();
    expect(screen.getByText(/Markdown is a lightweight markup language/)).toBeInTheDocument();
    expect(screen.getByText("Supported Features:")).toBeInTheDocument();
    expect(screen.getByText("Quick Reference:")).toBeInTheDocument();
  });

  it("has proper accessibility labels", () => {
    render(<MarkdownPreviewer />);
    
    expect(screen.getByLabelText("Markdown Content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Load Sample" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download MD" })).toBeInTheDocument();
  });

  it("handles empty input gracefully", async () => {
    const user = userEvent.setup();
    
    render(<MarkdownPreviewer />);
    
    const textarea = screen.getByLabelText("Markdown Content") as HTMLTextAreaElement;
    await user.clear(textarea);
    
    expect(screen.getByText("Your markdown preview will appear here")).toBeInTheDocument();
    expect(screen.getByText("Start typing in the editor to see the live preview")).toBeInTheDocument();
  });


});