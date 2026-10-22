import "@testing-library/jest-dom";

// Polyfill ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill IntersectionObserver for tests
if (!global.IntersectionObserver) {
  // @ts-ignore
  global.IntersectionObserver = class IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.callback = callback;
      if (options?.root) this.root = options.root;
      if (options?.rootMargin) this.rootMargin = options.rootMargin;
      if (options?.threshold) {
        this.thresholds = Array.isArray(options.threshold) ? options.threshold : [options.threshold];
      }
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}

if (typeof window !== "undefined" && !window.IntersectionObserver) {
  window.IntersectionObserver = global.IntersectionObserver;
}

// Polyfill PointerEvent for Radix UI
if (!global.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
    }
  }
  // @ts-ignore
  global.PointerEvent = PointerEvent;
}

// Polyfill element methods for Radix UI and cmdk
Object.assign(window.HTMLElement.prototype, {
  scrollIntoView: vi.fn(),
  hasPointerCapture: vi.fn(() => false),
  setPointerCapture: vi.fn(),
  releasePointerCapture: vi.fn(),
});