/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Add custom matchers
expect.extend({});

// Mock window.confirm and window.alert
global.confirm = () => true;
global.alert = () => {};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Pre-register the validation station custom element so
// customElements.whenDefined(...) resolves in tests without booting the real WC.
const VS_TAG = "ui-du-validation-station-standalone-wc-element";
if (typeof window !== "undefined" && !customElements.get(VS_TAG)) {
  customElements.define(VS_TAG, class extends HTMLElement {});
}
