// setupTests.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.localStorage
// global.Storage.prototype.setItem = vi.fn()
// global.Storage.prototype.getItem = vi.fn()
// global.Storage.prototype.removeItem = vi.fn()
// global.Storage.prototype.clear = vi.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
}
