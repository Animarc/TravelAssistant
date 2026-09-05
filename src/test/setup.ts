import '@testing-library/jest-dom/vitest';

class ResizeObserverStub {
  observe() { /* Browser API stub for component tests. */ }
  unobserve() { /* Browser API stub for component tests. */ }
  disconnect() { /* Browser API stub for component tests. */ }
}

globalThis.ResizeObserver = ResizeObserverStub;
