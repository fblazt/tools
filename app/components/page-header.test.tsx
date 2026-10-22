import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect, vi } from "vitest";
import { Wrench } from "lucide-react";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders title and description in the in-content hero header", () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Custom Tool"
          description="A handy developer tool for transformations."
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /custom tool/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText("A handy developer tool for transformations.")).toBeInTheDocument();
  });

  it("renders default SearchButton and ThemeToggle when actions is not provided", () => {
    render(
      <MemoryRouter>
        <PageHeader title="Custom Tool" />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /search tools/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });

  it("renders custom actions when provided, replacing default actions", () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Custom Tool"
          actions={<button type="button">Run Action</button>}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: "Run Action" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /search tools/i })).not.toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Custom Tool"
          icon={Wrench}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /custom tool/i })).toBeInTheDocument();
  });

  it("renders breadcrumbs correctly", () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Custom Tool"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Category", href: "/category" },
            { label: "Custom Tool" },
          ]}
        />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveAttribute("href", "/");

    const categoryLink = screen.getByRole("link", { name: "Category" });
    expect(categoryLink).toHaveAttribute("href", "/category");

    const pageCrumb = screen.getByText("Custom Tool", { selector: "span[aria-current='page']" });
    expect(pageCrumb).toBeInTheDocument();
    expect(pageCrumb).toHaveClass("font-mono", "text-xs");
  });

  it("renders badge when provided", () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Custom Tool"
          badge={<span data-testid="test-badge">Beta</span>}
        />
      </MemoryRouter>
    );

    expect(screen.getAllByTestId("test-badge").length).toBeGreaterThanOrEqual(1);
  });

  it("applies font-sans font-bold to title and font-mono text-sm to subtitle", () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Custom Tool"
          description="A handy developer tool for transformations."
        />
      </MemoryRouter>
    );

    const heading = screen.getByRole("heading", { name: /custom tool/i, level: 1 });
    expect(heading).toHaveClass("font-sans", "font-bold");

    const subtitle = screen.getByText("A handy developer tool for transformations.");
    expect(subtitle).toHaveClass("font-mono", "text-sm", "text-[#7c7c67]");
  });

  it("renders sticky top pill element with title and icon", () => {
    const { container } = render(
      <MemoryRouter>
        <PageHeader
          title="Sticky Tool Title"
          icon={Wrench}
        />
      </MemoryRouter>
    );

    const pill = container.querySelector('[data-slot="page-header-pill"]');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveTextContent("Sticky Tool Title");
    // Initially not scrolled, so opacity-0
    expect(pill).toHaveClass("opacity-0");
    expect(pill).toHaveClass("rounded-none");
    expect(pill).toHaveClass("border-[#e8e8e3]");
  });

  it("toggles sticky pill state on scroll when fallback scroll listener is used", () => {
    // Temporarily undefine IntersectionObserver to test scroll listener fallback
    const originalIO = window.IntersectionObserver;
    // @ts-ignore
    delete window.IntersectionObserver;

    const { container } = render(
      <MemoryRouter>
        <PageHeader title="Scrollable Tool" />
      </MemoryRouter>
    );

    const pill = container.querySelector('[data-slot="page-header-pill"]');
    expect(pill).toHaveClass("opacity-0");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 100, writable: true, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(pill).toHaveClass("opacity-100");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(pill).toHaveClass("opacity-0");

    // Restore IntersectionObserver
    window.IntersectionObserver = originalIO;
  });

  it("toggles sticky pill state when IntersectionObserver triggers", () => {
    let observerCallback: IntersectionObserverCallback | null = null;

    const mockObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    };

    const originalIO = window.IntersectionObserver;
    // @ts-ignore
    window.IntersectionObserver = mockObserver;

    const { container } = render(
      <MemoryRouter>
        <PageHeader title="Observed Tool" />
      </MemoryRouter>
    );

    const pill = container.querySelector('[data-slot="page-header-pill"]');
    expect(pill).toHaveClass("opacity-0");

    // Simulate hero leaving viewport
    act(() => {
      if (observerCallback) {
        observerCallback(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      }
    });

    expect(pill).toHaveClass("opacity-100");

    // Simulate hero returning to viewport
    act(() => {
      if (observerCallback) {
        observerCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      }
    });

    expect(pill).toHaveClass("opacity-0");

    // Restore
    window.IntersectionObserver = originalIO;
  });
});
