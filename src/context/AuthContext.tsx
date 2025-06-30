'use client'

import { UserInfo } from '@schema'
import React, { PropsWithChildren, createContext, useContext, useState } from 'react'
import { nanoid } from 'nanoid'
import { useLatest } from '@hooks'
import { storage } from '@lib/localStorage'

export const authContext = createContext<UserInfo | null>(null)

export const authUpdaterContext = createContext<(value: UserInfo | null) => void>(() => {})

type Props = {
  userInfo: UserInfo | null
} & PropsWithChildren

export const AuthProvider = ({ children, userInfo }: Props) => {
  const [state, setState] = useState<UserInfo | null>(userInfo)

  const setUserInfo = useLatest((value: UserInfo | null) => {
    setState(value)
  })

  React.useEffect(() => {
    const session =
      storage.getActiveSession() ||
      storage.setActiveSession({
        id: nanoid(),
        userId: nanoid(),
        username: 'Elof Max',
      })
    setUserInfo.current({
      id: session.userId,
      name: session.username,
      sessionId: session.id,
      favorites: [],
    })
  }, [])

  return (
    <authContext.Provider value={state}>
      <authUpdaterContext.Provider value={setUserInfo.current}>{children}</authUpdaterContext.Provider>
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
