import Page from '@/app/[locale]/page'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect } from 'vitest'
import { withProviders } from './utils/withProviders'

describe('Page', () => {
  test('renders a heading', async () => {
    const component = await Page()

    const { getByTestId, getByRole } = render(withProviders({ render: () => component, locale: 'en' }))

    const main = getByTestId('main')

    expect(main).toBeInTheDocument()
  })
})
