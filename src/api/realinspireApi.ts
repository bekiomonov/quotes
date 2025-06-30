import { ApiInstance } from '@/lib/utils'

export type RealinspireQuote = {
  /** Quote text */
  content: string
  /**author name */
  author: string
  /**pre-formatted HTML quote */
  authorSlug: string
}[]

export const realinspireApi = new ApiInstance('https://api.realinspire.live/v1/quotes')
