import "@testing-library/jest-dom";

// Polyfill ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

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