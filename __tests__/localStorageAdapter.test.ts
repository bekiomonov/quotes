import { LocalStorageAdapter, SessionData } from '@service/storage'
import { vi } from 'vitest'

// Mock localStorage
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

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    adapter = new LocalStorageAdapter()
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with browser detection', () => {
      expect(adapter).toBeInstanceOf(LocalStorageAdapter)
    })
  })

  describe('getItem', () => {
    it('should return parsed item from localStorage', () => {
      const testData = { name: 'John', age: 30 }
      localStorageMock.setItem('test-key', JSON.stringify(testData))

      const result = adapter.getItem<typeof testData>('test-key')

      expect(result).toEqual(testData)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
    })

    it('should return null for non-existent key', () => {
      const result = adapter.getItem('non-existent')

      expect(result).toBeNull()
      expect(localStorageMock.getItem).toHaveBeenCalledWith('non-existent')
    })

    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-json{')

      const result = adapter.getItem('invalid-key')

      expect(result).toBeNull()
    })

    it('should return null in non-browser environment', () => {
      // Create adapter that thinks it's not in browser
      const nonBrowserAdapter = new LocalStorageAdapter()
      // @ts-ignore - accessing private property for testing
      nonBrowserAdapter['#isBrowser'] = false

      const result = nonBrowserAdapter.getItem('test')

      expect(result).toBeNull()
    })
  })

  describe('setItem', () => {
    it('should set item in localStorage with JSON stringification', () => {
      const testData = { id: 1, name: 'Test' }

      adapter.setItem('test-key', testData)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData))
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded')
      })

      adapter.setItem('test-key', 'test-value')
    })
  })

  describe('removeItem', () => {
    it('should remove item from localStorage', () => {
      adapter.removeItem('test-key')

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should handle removal errors gracefully', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Remove failed')
      })

      adapter.removeItem('test-key')
    })
  })

  describe('clear', () => {
    it('should clear all localStorage', () => {
      adapter.clear()

      expect(localStorageMock.clear).toHaveBeenCalled()
    })

    it('should handle clear errors gracefully', () => {
      localStorageMock.clear.mockImplementationOnce(() => {
        throw new Error('Clear failed')
      })

      adapter.clear()
    })
  })

  describe('session management', () => {
    const mockSession: SessionData = {
      userId: 'user-123',
      id: 'session-456',
      username: 'testuser',
      favorites: [],
    }

    it('should set active session', () => {
      const result = adapter.setActiveSession(mockSession)

      expect(result).toEqual(mockSession)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('active_session', JSON.stringify(mockSession))
    })

    it('should get active session', () => {
      localStorageMock.setItem('active_session', JSON.stringify(mockSession))

      const result = adapter.getActiveSession()

      expect(result).toEqual(mockSession)
    })

    it('should return null when no active session', () => {
      const result = adapter.getActiveSession()

      expect(result).toBeNull()
    })

    it('should end session by removing session key', () => {
      adapter.endSession()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('active_session')
    })

    it('should throw error for isSessionActive method', () => {
      expect(() => adapter.isSessionActive()).toThrow('Method not implemented.')
    })
  })
})
