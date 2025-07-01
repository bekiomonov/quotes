// setupTests.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { nanoid } from 'nanoid'
import { vi } from 'vitest'
import './envConfig.ts'

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

// mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
// mock IntersectionObserver
class IntersectionObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
})

// mock ResizeObserver
class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserver,
})

const handlers = [
  http.get(process.env.NEXT_PUBLIC_DUMMYJSON_API!, () => {
    return HttpResponse.json({
      id: nanoid(),
      quote: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
    })
  }),
  http.get(process.env.NEXT_PUBLIC_REALINSPIRE_API!, () => {
    return HttpResponse.json({
      content: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      authorSlug: 'Steve-Jobs',
    })
  }),
]

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen()
})

afterAll(() => {
  server.close()
})

afterEach(() => {
  server.resetHandlers()
  cleanup()
})
