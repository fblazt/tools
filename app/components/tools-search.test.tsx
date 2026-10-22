import { render, screen, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ToolsSearch, SearchButton, openToolsSearch } from "~/components/tools-search";
import { MemoryRouter } from "react-router";

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ToolsSearch", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders SearchButton with keyboard shortcut", () => {
    render(
      <MemoryRouter>
        <ToolsSearch />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /search tools/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("opens command palette when trigger button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToolsSearch />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /search tools/i });
    await user.click(button);

    expect(screen.getByPlaceholderText("Search tools or commands...")).toBeInTheDocument();
  });

  it("opens command palette via openToolsSearch helper", () => {
    render(
      <MemoryRouter>
        <ToolsSearch showTrigger={false} />
      </MemoryRouter>
    );

    act(() => {
      openToolsSearch();
    });

    expect(screen.getByPlaceholderText("Search tools or commands...")).toBeInTheDocument();
  });

  it("displays all tools when search is empty", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToolsSearch />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /search tools/i });
    await user.click(button);

    expect(screen.getByText("QR Code Generator")).toBeInTheDocument();
    expect(screen.getByText("JWT Decoder")).toBeInTheDocument();
    expect(screen.getByText("Image to WebP Converter")).toBeInTheDocument();
    expect(screen.getByText("Markdown Editor")).toBeInTheDocument();
    expect(screen.getByText("JSON API Tester")).toBeInTheDocument();
  });

  it("filters tools based on search query", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToolsSearch />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /search tools/i });
    await user.click(button);

    const searchInput = screen.getByPlaceholderText("Search tools or commands...");
    await user.type(searchInput, "qr");

    expect(screen.getByText("QR Code Generator")).toBeInTheDocument();
    expect(screen.queryByText("JWT Decoder")).not.toBeInTheDocument();
  });

  it("navigates to internal tool when selected", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToolsSearch />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /search tools/i });
    await user.click(button);

    const qrTool = screen.getByText("QR Code Generator");
    await user.click(qrTool);

    expect(mockNavigate).toHaveBeenCalledWith("/tools/qr-generator");
  });

  it("opens external URL when external tool is selected", async () => {
    const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToolsSearch />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /search tools/i });
    await user.click(button);

    const mdTool = screen.getByText("Markdown Editor");
    await user.click(mdTool);

    expect(windowOpenSpy).toHaveBeenCalledWith("https://md.fblazt.xyz", "_blank", "noopener,noreferrer");
    expect(mockNavigate).not.toHaveBeenCalled();
    windowOpenSpy.mockRestore();
  });

  it("does not render trigger button when showTrigger is false", () => {
    render(
      <MemoryRouter>
        <ToolsSearch showTrigger={false} />
      </MemoryRouter>
    );

    expect(screen.queryByRole("button", { name: /search tools/i })).not.toBeInTheDocument();
  });

  it("opens command palette via keyboard shortcut ⌘K", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToolsSearch showTrigger={false} />
      </MemoryRouter>
    );

    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByPlaceholderText("Search tools or commands...")).toBeInTheDocument();
  });

  it("SearchButton calls custom onClick if provided", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<SearchButton onClick={handleClick} />);

    await user.click(screen.getByRole("button", { name: /search tools/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});