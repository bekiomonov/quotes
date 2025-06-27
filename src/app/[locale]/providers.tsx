'use client'

import type { ThemeProviderProps } from 'next-themes'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { Locale, NextIntlClientProvider } from 'next-intl'

export interface ProvidersProps {
  children: React.ReactNode
  themeProps?: ThemeProviderProps
  locale: Locale
}

export function Providers({ children, themeProps, locale }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale}>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </NextIntlClientProvider>
  )
}
