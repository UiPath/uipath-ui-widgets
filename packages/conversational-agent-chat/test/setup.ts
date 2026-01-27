/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Add custom matchers
expect.extend({})

// Mock window.confirm and window.alert
global.confirm = () => true
global.alert = () => {}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

// Mock CSS imports
vi.mock('*.css', () => ({}))
vi.mock('*.scss', () => ({}))
