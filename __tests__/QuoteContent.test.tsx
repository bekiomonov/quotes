import { dummyjsonApi, realinspireApi } from '@/api'
import { QuoteContent } from '@/components/ui'
import { quoteStorage } from '@lib/quoteStorage'
import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, vi } from 'vitest'

vi.mock('@lib/quoteStorage', () => ({
  quoteStorage: {
    removeItem: vi.fn(),
    setQuote: vi.fn(),
    getRandom: vi.fn(),
    updateLike: vi.fn(),
    updateRating: vi.fn(),
  },
}))
vi.mock('@lib/localStorage', () => ({
  storage: vi.fn(),
}))

describe('QuoteContent', () => {
  beforeAll(() => {})
  beforeEach(() => {
    quoteStorage.removeItem('quotes')
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('Should fetch quotes on mount', async () => {
    const spyDummyjsonApi = vi.spyOn(dummyjsonApi, 'get')
    const spyRealinspireApi = vi.spyOn(realinspireApi, 'get')
    await waitFor(() => render(<QuoteContent />))

    expect(spyDummyjsonApi).toHaveBeenCalledTimes(1)
    expect(spyRealinspireApi).toHaveBeenCalledTimes(1)
  })

  test('Should fetch quote and render 1 slide', async () => {
    const { getByTestId, getAllByTestId } = await waitFor(() => render(<QuoteContent />))
    await waitFor(() => {
      expect(getByTestId('slide')).toBeInTheDocument()
      expect(getAllByTestId('slide')).toHaveLength(1)
    })
  })
})
