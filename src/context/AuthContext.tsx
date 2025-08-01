'use client'

import { storage } from '@lib/localStorage'
import { UserInfo } from '@schema'
import { nanoid } from 'nanoid'
import React, { PropsWithChildren, createContext, useCallback, useContext, useState } from 'react'

export const authContext = createContext<UserInfo | null>(null)

export const authUpdaterContext = createContext<((value: UserInfo | null) => void) | null>(null)

type Props = {
  userInfo: UserInfo | null
} & PropsWithChildren

export const AuthProvider = ({ children, userInfo }: Props) => {
  const [state, setState] = useState<UserInfo | null>(() => {
    if (userInfo) {
      storage.setActiveSession({
        favorites: userInfo.favorites,
        id: userInfo.sessionId,
        userId: userInfo.id,
        username: userInfo.name,
      })
    }
    return userInfo
  })

  const setUserInfo = useCallback((value: UserInfo | null) => {
    setState(value)
  }, [])

  React.useEffect(() => {
    const session =
      storage.getActiveSession() ||
      storage.setActiveSession({
        id: nanoid(),
        userId: nanoid(),
        username: 'Elof Max',
        favorites: [],
      })
    setUserInfo({
      id: session.userId,
      name: session.username,
      sessionId: session.id,
      favorites: [],
    })
  }, [])

  return (
    <authContext.Provider value={state}>
      <authUpdaterContext.Provider value={setUserInfo}>{children}</authUpdaterContext.Provider>
    </authContext.Provider>
  )
}

export const useAuth = () => {
  const auth = useContext(authContext)
  if (typeof auth === 'undefined') {
    throw new Error('authContext must be used within a AuthProvider')
  }
  return auth
}

export const useAuthUpdater = () => {
  const updater = useContext(authUpdaterContext)

  if (typeof updater === 'undefined') {
    throw new Error('authUpdaterContext must be used within a AuthUpdaterProvider')
  }
  return updater
}
