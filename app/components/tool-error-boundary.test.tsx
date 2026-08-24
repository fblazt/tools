import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ToolErrorBoundary } from "./tool-error-boundary";

// Suppress console.error during expected error boundary tests
const originalConsoleError = console.error;

function FaultyComponent({ shouldThrow, errorMessage }: { shouldThrow: boolean; errorMessage?: string }) {
  if (shouldThrow) {
    throw new Error(errorMessage || "Test component error");
  }
  return <div>Component rendered successfully</div>;
}

describe("ToolErrorBoundary", () => {
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  it("renders children when no error occurs", () => {
    render(
      <ToolErrorBoundary toolName="Test Tool">
        <div>Safe content</div>
      </ToolErrorBoundary>
    );

    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  it("catches standard runtime errors and displays error message with 'Try again' button", () => {
    render(
      <ToolErrorBoundary toolName="Image Converter">
        <FaultyComponent shouldThrow={true} errorMessage="Custom runtime crash" />
      </ToolErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Image Converter encountered an unexpected error.")).toBeInTheDocument();
    expect(screen.getByText("Custom runtime crash")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("detects dynamic import chunk errors and displays 'Reload page' button", () => {
    render(
      <ToolErrorBoundary toolName="Image to WebP Converter">
        <FaultyComponent
          shouldThrow={true}
          errorMessage="Failed to fetch dynamically imported module: http://localhost:5173/app/components/tools/image-to-webp.tsx"
        />
      </ToolErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();
  });

  it("triggers window.location.reload when 'Reload page' is clicked on chunk error", () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...window.location, reload: reloadMock },
    });

    render(
      <ToolErrorBoundary toolName="Image to WebP Converter">
        <FaultyComponent
          shouldThrow={true}
          errorMessage="Failed to fetch dynamically imported module: http://localhost:5173/app/components/tools/image-to-webp.tsx"
        />
      </ToolErrorBoundary>
    );

    const reloadButton = screen.getByRole("button", { name: /reload page/i });
    fireEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
