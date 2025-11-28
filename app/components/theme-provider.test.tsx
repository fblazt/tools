import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeProvider, useTheme } from "./theme-provider";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.className = '';
  });

  it('provides theme context with default dark theme', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const TestComponent = () => {
      const { theme } = useTheme();
      return <div>Current theme: {theme}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('Current theme: dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('loads theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    const TestComponent = () => {
      const { theme } = useTheme();
      return <div>Current theme: {theme}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('Current theme: light')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('updates theme when setTheme is called', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    const TestComponent = () => {
      const { theme, setTheme } = useTheme();
      return (
        <div>
          <div>Current theme: {theme}</div>
          <button onClick={() => setTheme('light')}>Toggle to light</button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('Current theme: dark')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Toggle to light'));
    
    expect(screen.getByText('Current theme: light')).toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('vite-ui-theme', 'light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });


});