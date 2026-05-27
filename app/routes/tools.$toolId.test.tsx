import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { SidebarProvider } from "~/components/ui/sidebar";
import ToolPage from "./tools.$toolId";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

function renderToolRoute(toolId: string) {
  return render(
    <MemoryRouter initialEntries={[`/tools/${toolId}`]}>
      <SidebarProvider>
        <Routes>
          <Route path="/tools/:toolId" element={<ToolPage />} />
        </Routes>
      </SidebarProvider>
    </MemoryRouter>
  );
}

describe("tools.$toolId route", () => {
  it("renders tool component for valid tool ID", async () => {
    renderToolRoute("jwt-decoder");
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "JWT Decoder" })).toBeInTheDocument();
    });
  });

  it("shows not-found state for invalid tool ID", () => {
    renderToolRoute("nonexistent-tool");
    expect(screen.getByRole("heading", { name: "Tool Not Found" })).toBeInTheDocument();
    expect(screen.getByText("The tool you're looking for doesn't exist.")).toBeInTheDocument();
  });

  it("shows link back to home for invalid tool", () => {
    renderToolRoute("nonexistent-tool");
    expect(screen.getByRole("link", { name: /go back home/i })).toHaveAttribute("href", "/");
  });
});
