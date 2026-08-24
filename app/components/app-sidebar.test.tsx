import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { toolsByCategory } from "~/lib/tools-registry";

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

function renderSidebar(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    </MemoryRouter>
  );
}

describe("AppSidebar", () => {
  it("renders all category labels", () => {
    renderSidebar();
    for (const category of toolsByCategory) {
      expect(screen.getByText(category.title)).toBeInTheDocument();
    }
  });

  it("renders all tool links", () => {
    renderSidebar();
    for (const category of toolsByCategory) {
      for (const tool of category.tools) {
        expect(screen.getByRole("link", { name: tool.title })).toBeInTheDocument();
      }
    }
  });

  it("marks the active tool based on current path", () => {
    renderSidebar("/tools/jwt-decoder");
    const activeLink = screen.getByRole("link", { name: "JWT Decoder" });
    expect(activeLink.closest("[data-active=true]")).toBeInTheDocument();
  });

  it("links point to correct tool URLs", () => {
    renderSidebar();
    const link = screen.getByRole("link", { name: "QR Code Generator" });
    expect(link).toHaveAttribute("href", "/tools/qr-generator");

    const externalLink = screen.getByRole("link", { name: "Markdown Editor" });
    expect(externalLink).toHaveAttribute("href", "https://md.fblazt.xyz");
    expect(externalLink).toHaveAttribute("target", "_blank");
    expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
