import { Quote } from '@schema'

import { QuoteStorage } from '@lib/quoteStorage'
import { getRandomInt } from '@utils'
import { Mock, vi } from 'vitest'

// Mock the utils module
vi.mock('@utils', () => ({
  getRandomInt: vi.fn((min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min),
}))

const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

// Mock window object
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('QuoteStorage', () => {
  let quoteStorage: QuoteStorage

  const mockQuote1: Quote = {
    id: 'quote-1',
    content: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    rating: 5,
    isFavorite: true,
    source: 'https://example.com',
  }

  const mockQuote2: Quote = {
    id: 'quote-2',
    content: 'Innovation distinguishes between a leader and a follower.',
    author: 'Steve Jobs',
    rating: 4,
    isFavorite: false,
    source: 'https://example.com',
  }

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    quoteStorage = new QuoteStorage()
  })

  describe('constructor', () => {
    it('should load existing quotes into quotesMap when already initialized', () => {
      localStorageMock.setItem('quotes', JSON.stringify([mockQuote1, mockQuote2]))

      const newStorage = new QuoteStorage()

      expect(newStorage.quotesMap).toEqual({
        'quote-1': mockQuote1,
        'quote-2': mockQuote2,
      })
    })

    it('should handle non-array quotes data gracefully', () => {
      localStorageMock.setItem('quotes', JSON.stringify('invalid-data'))

      const newStorage = new QuoteStorage()

      expect(newStorage.quotesMap).toEqual({})
    })
  })

  describe('setQuote', () => {
    it('should add new quote to storage', () => {
      quoteStorage.setQuote(mockQuote1)

      expect(quoteStorage.quotesMap[mockQuote1.id]).toEqual(mockQuote1)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('quotes', JSON.stringify([mockQuote1]))
    })

    it('should not add duplicate quote and log cache hit', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      quoteStorage.setQuote(mockQuote1)
      vi.clearAllMocks()

      quoteStorage.setQuote(mockQuote1)

      expect(consoleSpy).toHaveBeenCalledWith('Cache Hit')
      expect(localStorageMock.setItem).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should handle non-array quotes data in storage', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-data')

      quoteStorage.setQuote(mockQuote1)

      // Should not throw error, and quote should not be added to quotesMap
      expect(quoteStorage.quotesMap[mockQuote1.id]).toBeUndefined()
    })
  })

  describe('getQuote', () => {
    beforeEach(() => {
      localStorageMock.setItem('quotes', JSON.stringify([mockQuote1, mockQuote2]))
    })

    it('should return quote by id', () => {
      const result = quoteStorage.getQuote('quote-1')

      expect(result).toEqual(mockQuote1)
    })

    it('should return undefined for non-existent id', () => {
      const result = quoteStorage.getQuote('non-existent')

      expect(result).toBeUndefined()
    })

    it('should handle non-array quotes data', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-data')

      const result = quoteStorage.getQuote('quote-1')

      expect(result).toBeUndefined()
    })
  })

  describe('getRandom', () => {
    beforeEach(() => {
      localStorageMock.setItem('quotes', JSON.stringify([mockQuote1, mockQuote2]))
      ;(getRandomInt as Mock).mockReturnValue(0)
    })

    it('should return random quote', () => {
      const result = quoteStorage.getRandom()

      expect(result).toEqual(mockQuote1)
      expect(getRandomInt).toHaveBeenCalledWith(0, 1)
    })

    it('should handle empty quotes array', () => {
      localStorageMock.getItem.mockReturnValueOnce(null)
      ;(getRandomInt as Mock).mockReturnValue(0)

      const result = quoteStorage.getRandom()

      expect(result).toBeUndefined()
    })

    it('should handle non-array quotes data', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-data')

      const result = quoteStorage.getRandom()

      expect(result).toBeUndefined()
    })
  })

  describe('getQuotes', () => {
    it('should return all quotes', () => {
      const quotes = [mockQuote1, mockQuote2]
      localStorageMock.setItem('quotes', JSON.stringify(quotes))

      const result = quoteStorage.getQuotes()

      expect(result).toEqual(quotes)
    })
  })

  describe('removeQuote', () => {
    beforeEach(() => {
      localStorageMock.setItem('quotes', JSON.stringify([mockQuote1, mockQuote2]))
    })

    it('should remove quote by id and return true', () => {
      const result = quoteStorage.removeQuote('quote-1')

      expect(result).toBe(true)
      // Note: The current implementation uses delete which creates sparse array
      expect(localStorageMock.setItem).toHaveBeenCalledWith('quotes', expect.stringContaining('quote-2'))
    })

    it('should return false for non-existent quote', () => {
      const result = quoteStorage.removeQuote('non-existent')

      expect(result).toBe(false)
    })

    it('should handle non-array quotes data', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-data')

      const result = quoteStorage.removeQuote('quote-1')

      expect(result).toBe(false)
    })
  })

  describe('updateQuote', () => {
    const updatedQuote: Quote = { ...mockQuote1, content: 'Updated text' }

    beforeEach(() => {
      localStorageMock.setItem('quotes', JSON.stringify([mockQuote1, mockQuote2]))
    })

    it('should update existing quote', () => {
      const result = quoteStorage.updateQuote(updatedQuote)

      expect(result).toEqual(updatedQuote)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('quotes', expect.stringContaining('Updated text'))
    })

    it('should return undefined for non-existent quote', () => {
      const nonExistentQuote: Quote = { ...mockQuote1, id: 'non-existent' }

      const result = quoteStorage.updateQuote(nonExistentQuote)

      expect(result).toBeUndefined()
    })

    it('should handle non-array quotes data', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-data')

      const result = quoteStorage.updateQuote(updatedQuote)

      expect(result).toBeUndefined()
    })
  })

  describe('updateRating', () => {
    beforeEach(() => {
      localStorageMock.setItem('quotes', JSON.stringify([mockQuote1, mockQuote2]))
    })

    it('should update quote rating', () => {
      const result = quoteStorage.updateRating('quote-1', 3)

      expect(result).toEqual({ ...mockQuote1, rating: 3 })
    })

    it('should return undefined for non-existent quote', () => {
      const result = quoteStorage.updateRating('non-existent', 3)

      expect(result).toBeUndefined()
    })
  })

  describe('updateLike', () => {
    beforeEach(() => {
      localStorageMock.setItem('quotes', JSON.stringify([mockQuote1, mockQuote2]))
    })

    it('should update quote favorite status', () => {
      const result = quoteStorage.updateLike('quote-2', true)

      expect(result).toEqual({ ...mockQuote2, isFavorite: true })
    })

    it('should return undefined for non-existent quote', () => {
      const result = quoteStorage.updateLike('non-existent', true)

      expect(result).toBeUndefined()
    })
  })
})
