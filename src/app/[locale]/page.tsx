import { dummyjsonApi, DummyJsonQuote, ZenQuote, zenQuotesApi } from '@api'
import { QuoteContent } from '@components/ui'
import { Buffer } from 'buffer'
import { nanoid } from 'nanoid'

export function getPromises() {
  const controllers: AbortController[] = []

  return {
    promises: [
      dummyjsonApi
        .get<DummyJsonQuote>('/random', {
          init: {},
          beforeRequest: (controller) => {
            controllers.push(controller)
          },
        })
        .then((res) => ({
          author: res.author,
          content: res.quote,
          id: nanoid(),
          source: 'https://dummyjson.com/quotes/random',
          rating: 0,
          isFavorite: false,
        })),
      zenQuotesApi
        .get<ZenQuote>('/random', {
          init: {},
          beforeRequest: (controller) => {
            controllers.push(controller)
          },
        })
        .then((res) => ({
          author: res[0].author,
          content: res[0].content,
          id: Buffer.from(res[0].content, 'utf8').toString('base64'),
          source: 'https://api.realinspire.live/v1/quotes/random',
          rating: 0,
          isFavorite: false,
        })),
    ],
    controllers,
  }
}

export default async function Home() {
  return (
    <main className='flex items-center justify-center w-full'>
      <QuoteContent />
    </main>
  )
}
