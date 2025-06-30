import { Loader } from '@/components/core'
import { MainNav } from '@/components/ui'
import { routing } from '@/i18n/routing'
import '@styles'
import type { Metadata, Viewport } from 'next'
import { hasLocale, Locale } from 'next-intl'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Providers } from './providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Quotes',
  description: 'Get random quote',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return (
    <html suppressHydrationWarning lang={locale}>
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers
          locale={locale}
          userInfo={null}
          themeProps={{
            attribute: 'class',
            defaultTheme: 'system',
            enableSystem: true,
            disableTransitionOnChange: false,
          }}
        >
          <Suspense
            fallback={
              <div className='flex min-h-dvh items-center justify-center'>
                <Loader size='lg' />
              </div>
            }
          >
            <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-4 pb-20 gap-16 sm:p-10 font-[family-name:var(--font-geist-sans)]'>
              <MainNav />
              {children}
              <footer className='row-start-3 flex gap-[24px] flex-wrap items-center justify-center'></footer>
            </div>
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
