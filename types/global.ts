import { formats } from '@/i18n/request'
import { routing } from '@/i18n/routing'

import messages from '@assets/messages/en.json'

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: typeof messages
    Formats: typeof formats
  }
}

/// <reference types="@vitest/browser/context" />
