'use client'

import type { ThemeProviderProps } from 'next-themes'

import { UserInfo } from '@/schema'
import { AuthProvider } from '@context'
import { Locale, NextIntlClientProvider } from 'next-intl'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import * as React from 'react'

export interface ProvidersProps {
  children: React.ReactNode
  themeProps?: ThemeProviderProps
  locale: Locale
  userInfo: UserInfo | null
}

export function Providers({ children, themeProps, locale, userInfo }: ProvidersProps) {
  return (
    <NextThemesProvider {...themeProps}>
      <NextIntlClientProvider locale={locale}>
        <AuthProvider userInfo={userInfo}>{children}</AuthProvider>
      </NextIntlClientProvider>
    </NextThemesProvider>
  )
}
