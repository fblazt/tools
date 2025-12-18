import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ToolsSearch } from "~/components/tools-search";
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

  it("renders search button with keyboard shortcut", () => {
    render(
      <MemoryRouter>
        <ToolsSearch />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("Search tools (⌘K)")).toBeInTheDocument();
    expect(screen.getByText("Search tools...")).toBeInTheDocument();
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("opens command palette when button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToolsSearch />
      </MemoryRouter>
    );

    const searchButton = screen.getByLabelText("Search tools (⌘K)");
    await user.click(searchButton);

    expect(screen.getByPlaceholderText("Search tools...")).toBeInTheDocument();
  });

  it("displays all tools when search is empty", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToolsSearch />
      </MemoryRouter>
    );

    const searchButton = screen.getByLabelText("Search tools (⌘K)");
    await user.click(searchButton);

    expect(screen.getByText("QR Code Generator")).toBeInTheDocument();
    expect(screen.getByText("JWT Decoder")).toBeInTheDocument();
    expect(screen.getByText("Image to WebP Converter")).toBeInTheDocument();
    expect(screen.getByText("Markdown Previewer")).toBeInTheDocument();
    expect(screen.getByText("JSON API Tester")).toBeInTheDocument();
  });

  it("filters tools based on search query", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToolsSearch />
      </MemoryRouter>
    );

    const searchButton = screen.getByLabelText("Search tools (⌘K)");
    await user.click(searchButton);

    const searchInput = screen.getByPlaceholderText("Search tools...");
    await user.type(searchInput, "qr");

    expect(screen.getByText("QR Code Generator")).toBeInTheDocument();
    expect(screen.queryByText("JWT Decoder")).not.toBeInTheDocument();
  });

  it("navigates to tool when selected", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToolsSearch />
      </MemoryRouter>
    );

    const searchButton = screen.getByLabelText("Search tools (⌘K)");
    await user.click(searchButton);

    const qrTool = screen.getByText("QR Code Generator");
    await user.click(qrTool);

    expect(mockNavigate).toHaveBeenCalledWith("/tools/qr-generator");
  });
});