import Page from '@/app/[locale]/page'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect, vi } from 'vitest'
import { withProviders } from './utils/withProviders'

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

describe('Page', () => {
  test('renders a heading', async () => {
    const component = await Page()

    const { getByTestId, getByRole } = render(withProviders({ render: () => component, locale: 'en' }))

    const main = getByTestId('main')

    expect(main).toBeInTheDocument()
  })
})
