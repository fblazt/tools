import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { tools, toolsByCategory } from "~/lib/tools-registry";

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

  it("renders all tool links in desktop sidebar and mobile navigation", () => {
    renderSidebar();
    for (const category of toolsByCategory) {
      for (const tool of category.tools) {
        const links = screen.getAllByRole("link", { name: tool.title });
        expect(links.length).toBe(2);
      }
    }
  });

  it("marks the active tool based on current path on desktop and mobile", () => {
    renderSidebar("/tools/jwt-decoder");
    const links = screen.getAllByRole("link", { name: "JWT Decoder" });
    expect(links.length).toBe(2);

    // Desktop link is wrapped in an element with data-active="true" and has active styling
    const desktopLink = links.find((link) => link.closest("[data-active=true]"));
    expect(desktopLink).toBeDefined();
    expect(desktopLink).toHaveClass("bg-primary", "text-primary-foreground", "rounded-none");

    // Mobile link has active highlight styling and rounded-none
    const mobileLink = links.find((link) => !link.closest("[data-active=true]"));
    expect(mobileLink).toBeDefined();
    expect(mobileLink).toHaveClass("bg-primary", "text-primary-foreground", "rounded-none");
  });

  it("renders desktop header branding as solid fill pod on root and tool pages", () => {
    renderSidebar("/");
    const brandLink = screen.getByRole("link", { name: "Tools Home" });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute("href", "/");
    expect(screen.getByText("Tools")).toBeInTheDocument();
    expect(brandLink).toHaveClass("bg-primary", "text-primary-foreground", "rounded-none");
  });

  it("renders header branding with solid fill on tool page as well", () => {
    renderSidebar("/tools/jwt-decoder");
    const brandLink = screen.getByRole("link", { name: "Tools Home" });
    expect(brandLink).toHaveClass("bg-primary", "text-primary-foreground", "rounded-none");
  });

  it("links point to correct tool URLs", () => {
    renderSidebar();
    const qrLinks = screen.getAllByRole("link", { name: "QR Code Generator" });
    for (const link of qrLinks) {
      expect(link).toHaveAttribute("href", "/tools/qr-generator");
    }
  });

  describe("Mobile Bottom Navigation Bar", () => {
    it("renders mobile navigation bar container with aria-label", () => {
      renderSidebar();
      const mobileNav = screen.getByRole("navigation", { name: "Mobile Navigation" });
      expect(mobileNav).toBeInTheDocument();
      expect(mobileNav).toHaveClass("fixed", "bottom-5", "md:hidden");
    });

    it("renders Home button linking to root with active state on /", () => {
      renderSidebar("/");
      const homeLink = screen.getByRole("link", { name: "Home" });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
      expect(homeLink).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("renders Home button with inactive state on tool page", () => {
      renderSidebar("/tools/jwt-decoder");
      const homeLink = screen.getByRole("link", { name: "Home" });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
      expect(homeLink).toHaveClass("text-muted-foreground");
    });

    it("renders all tools in mobile navigation bar sorted left to right", () => {
      renderSidebar();
      const mobileNav = screen.getByRole("navigation", { name: "Mobile Navigation" });
      const toolLinks = mobileNav.querySelectorAll("a");
      // 1 home link + number of tools
      expect(toolLinks.length).toBe(tools.length + 1);

      expect(toolLinks[0]).toHaveAttribute("href", "/");
      tools.forEach((tool, index) => {
        const expectedHref = tool.externalUrl || `/tools/${tool.id}`;
        expect(toolLinks[index + 1]).toHaveAttribute("href", expectedHref);
        expect(toolLinks[index + 1]).toHaveAttribute("title", tool.title);
      });
    });
  });
});
