import { AuthProvider } from '@/context'
import enMessages from '@assets/messages/en.json'
import ruMessages from '@assets/messages/ru.json'
import { Locale, NextIntlClientProvider } from 'next-intl'
import { ReactNode } from 'react'

const dic = {
  en: enMessages,
  ru: ruMessages,
}

export const withProviders = ({ render, ...rest }: { render: () => ReactNode; locale: Locale }) => {
  const { locale } = rest
  return (
    <NextIntlClientProvider locale={locale}>
      <AuthProvider userInfo={null}>{render()}</AuthProvider>
    </NextIntlClientProvider>
  )
}
