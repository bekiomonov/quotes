import { ApiInstance } from '@/lib/utils'

export type DummyJsonQuote = {
  id: number
  /**author name */
  author: string
  /** Quote text */
  quote: string
}

export const dummyjsonApi = new ApiInstance('https://dummyjson.com/quotes')
