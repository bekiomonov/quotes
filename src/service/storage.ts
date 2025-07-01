export interface SessionData {
  userId: string
  id: string
  username: string
  favorites: (number | string)[]
}

export interface StorageAdapter {
  getItem<T>(key: string): T | null
  setItem<T>(key: string, value: T): void
  removeItem(key: string): void
  clear(): void
  setActiveSession(session: SessionData): void
  getActiveSession(): SessionData | null
  isSessionActive(): boolean
  endSession(): void
}

export class LocalStorageAdapter implements StorageAdapter {
  #sessionKey = 'active_session'
  #isBrowser = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.#isBrowser = true
    }
  }

  getItem<T>(key: string): T | null {
    if (this.#isBrowser) {
      try {
        const item = localStorage.getItem(key)
        return item ? (JSON.parse(item) as T) : null
      } catch (error) {
        console.error(`Error reading localStorage key "${key}": `, error)
        return null
      }
    }
    return null
  }

  setItem<T>(key: string, value: T): void {
    try {
      if (this.#isBrowser) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}": `, error)
    }
  }
  removeItem(key: string): void {
    try {
      if (this.#isBrowser) {
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}": `, error)
    }
  }
  clear(): void {
    try {
      if (this.#isBrowser) {
        localStorage.clear()
      }
    } catch (error) {
      console.error('Error clearing localStorage', error)
    }
  }

  setActiveSession(session: SessionData) {
    this.setItem(this.#sessionKey, session)
    return this.getActiveSession()!
  }
  getActiveSession(): SessionData | null {
    return this.getItem<SessionData>(this.#sessionKey)
  }
  isSessionActive(): boolean {
    throw new Error('Method not implemented.')
  }
  endSession(): void {
    this.removeItem(this.#sessionKey)
  }
}
