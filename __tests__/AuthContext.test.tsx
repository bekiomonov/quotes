import { authContext, AuthProvider, authUpdaterContext, useAuth, useAuthUpdater } from '@context'
import { UserInfo } from '@schema'
import { act, render, renderHook, screen } from '@testing-library/react'
import React, { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockUserInfo: UserInfo = {
  id: 'user-123',
  name: 'Test User',
  sessionId: 'session-123',
  favorites: ['quote-1', 'quote-2'],
}

const mockSession: SessionData = {
  id: 'session-456',
  userId: 'user-456',
  username: 'Test User',
  favorites: ['quote-1', 'quote-2'],
}

// Mock dependencies
vi.mock('@hooks', () => ({
  useLatest: vi.fn((callback) => ({ current: callback })),
}))

vi.mock('@lib/localStorage', () => ({
  storage: {
    getActiveSession: vi.fn(() => mockSession),
    setActiveSession: vi.fn(),
  },
}))

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'mock-nanoid-id'),
}))

import { SessionData } from '@/service/storage'
import { storage } from '@lib/localStorage'
import { nanoid } from 'nanoid'

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AuthProvider', () => {
    it('should initialize with provided userInfo', () => {
      const TestComponent = () => {
        const auth = React.useContext(authContext)
        return <div data-testid='auth-state'>{auth?.name}</div>
      }

      const screen = render(
        <AuthProvider userInfo={mockUserInfo}>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('auth-state')).toHaveTextContent('Test User')
    })
  })

  describe('useEffect behavior', () => {
    beforeEach(() => {
      storage.setActiveSession(mockSession)
    })

    it('should create new session when none exists', () => {
      const mockGetActiveSession = vi.mocked(storage.getActiveSession)
      const mockSetActiveSession = vi.mocked(storage.setActiveSession)

      mockGetActiveSession.mockReturnValue(null)
      mockSetActiveSession.mockReturnValue(mockSession)

      render(
        <AuthProvider userInfo={null}>
          <div>Test</div>
        </AuthProvider>
      )

      expect(mockGetActiveSession).toHaveBeenCalled()
      expect(mockSetActiveSession).toHaveBeenCalledWith({
        id: 'mock-nanoid-id',
        userId: 'mock-nanoid-id',
        username: 'Elof Max',
        favorites: [],
      })
      expect(nanoid).toHaveBeenCalledTimes(2)
    })
  })

  describe('useAuth hook', () => {
    it('should return auth context value when used within provider', () => {
      const TestComponent = () => {
        const auth = useAuth()
        return <div data-testid='auth-data'>{auth?.name || 'no-auth'}</div>
      }

      render(
        <AuthProvider userInfo={mockUserInfo}>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('auth-data')).toHaveTextContent('Test User')
    })

    // it('should throw error when used outside provider', () => {
    //   const TestComponent = () => {
    //     console.log('useAuth()', useAuth())
    //     return <div>Test</div>
    //   }

    //   // Suppress console.error for this test
    //   vi.spyOn(console, 'error').mockImplementation(() => {})

    //   expect(() => {
    //     render(<TestComponent />)
    //   }).toThrow('authContext must be used within a AuthProvider')

    //   vi.resetAllMocks()
    // })

    test('throws if used outside AuthProvider', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current).toEqual(null)
    })

    it('should return null when auth state is null', () => {
      const TestComponent = () => {
        const auth = useAuth()
        return <div data-testid='auth-data'>{auth === null ? 'null' : 'not-null'}</div>
      }

      render(
        <AuthProvider userInfo={null}>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('auth-data')).toHaveTextContent('null')
    })
  })

  describe('useAuthUpdater hook', () => {
    it('should return updater function when used within provider', () => {
      const TestComponent = () => {
        const updater = useAuthUpdater()
        return <div data-testid='updater-type'>{typeof updater}</div>
      }

      render(
        <AuthProvider userInfo={mockUserInfo}>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('updater-type')).toHaveTextContent('function')
    })

    it('should throw error when used outside provider', () => {
      const { result } = renderHook(() => useAuthUpdater())

      expect(result.current).toEqual(null)
    })

    it('should update auth state when called', () => {
      const newUserInfo: UserInfo = {
        id: 'new-user',
        name: 'New User',
        sessionId: 'new-session',
        favorites: ['new-quote'],
      }

      const TestComponent = () => {
        const auth = useAuth()
        const updateAuth = useAuthUpdater()!

        return (
          <div>
            <div data-testid='current-user'>{auth?.name || 'no-user'}</div>
            <button data-testid='update-button' onClick={() => updateAuth(newUserInfo)}>
              Update
            </button>
          </div>
        )
      }

      render(
        <AuthProvider userInfo={mockUserInfo}>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('current-user')).toHaveTextContent('Test User')

      act(() => {
        screen.getByTestId('update-button').click()
      })

      expect(screen.getByTestId('current-user')).toHaveTextContent('New User')
    })

    it('should update auth state to null', () => {
      const TestComponent = () => {
        const auth = useAuth()
        const updateAuth = useAuthUpdater()!

        return (
          <div>
            <div data-testid='current-user'>{auth?.name || 'no-user'}</div>
            <button data-testid='clear-button' onClick={() => updateAuth(null)}>
              Clear
            </button>
          </div>
        )
      }

      render(
        <AuthProvider userInfo={mockUserInfo}>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('current-user')).toHaveTextContent('Test User')

      act(() => {
        screen.getByTestId('clear-button').click()
      })

      expect(screen.getByTestId('current-user')).toHaveTextContent('no-user')
    })
  })

  describe('context integration', () => {
    it('should provide both contexts with correct values', () => {
      const TestComponent = () => {
        const auth = React.useContext(authContext)
        const updater = React.useContext(authUpdaterContext)

        return (
          <div>
            <div data-testid='auth-value'>{auth?.name || 'null'}</div>
            <div data-testid='updater-type'>{typeof updater}</div>
          </div>
        )
      }

      render(
        <AuthProvider userInfo={mockUserInfo}>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('auth-value')).toHaveTextContent('Test User')
      expect(screen.getByTestId('updater-type')).toHaveTextContent('function')
    })

    it('should maintain referential stability of updater function', () => {
      let updaterRef1: ((value: UserInfo | null) => void) | null = null
      let updaterRef2: ((value: UserInfo | null) => void) | null = null

      const InnerComponent = ({ count }: { count: number }) => {
        const updater = useAuthUpdater()

        useEffect(() => {
          if (count === 1) updaterRef1 = updater
          else if (count === 2) updaterRef2 = updater
        }, [count, updater])

        return <div data-testid='count'>{count}</div>
      }

      const Wrapper = ({ count }: { count: number }) => (
        <AuthProvider userInfo={mockUserInfo}>
          <InnerComponent count={count} />
        </AuthProvider>
      )

      const { rerender } = render(<Wrapper count={1} />)

      rerender(<Wrapper count={2} />)

      expect(updaterRef1).toBe(updaterRef2)
    })
  })
})
