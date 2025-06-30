'use client'

import { Card, CardContent, CardFooter, Rating, RatingButton } from '@/components/core'
import { SignalConsumer } from '@/components/ui'
import { useSignal } from '@/hooks'
import { quoteStorage } from '@/lib/quoteStorage'
import { Quote } from '@schema'
import { useEffect } from 'react'

export default function Favorites() {
  const quotesSignal = useSignal<Quote[]>([])

  useEffect(() => {
    quotesSignal.value = quoteStorage.getQuotes()?.filter((it) => it.isFavorite) || []
  }, [])

  function onRatingChange(id: string | number, value: number) {
    quoteStorage.updateRating(id, value)

    quotesSignal((draft) => {
      const index = draft.findIndex((it) => it.id === id)
      if (index > -1) {
        draft[index].rating = value
      }
    })
  }

  return (
    <div>
      <ul className='flex flex-col gap-6'>
        <SignalConsumer signal={quotesSignal}>
          {({ value: state }) =>
            !state.length ? (
              <h5 className='text-muted-foreground text-xl tracking-tight'>Saved quotes will be here</h5>
            ) : (
              state.map((item) => (
                <li key={item.id}>
                  <Card>
                    <CardContent className='flex items-center justify-center p-6'>
                      <div className='space-y-2.5 w-full'>
                        <blockquote className='mt-6 border-l-2 pl-6 italic'>{item.content}</blockquote>
                        <span className='text-muted-foreground text-sm'>{item.author}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Rating
                        defaultValue={0}
                        value={item.rating}
                        onValueChange={(value) => onRatingChange(item.id, value)}
                      >
                        {Array.from({ length: 5 }).map((_, index) => (
                          <RatingButton size={15} key={index} />
                        ))}
                      </Rating>
                    </CardFooter>
                  </Card>
                </li>
              ))
            )
          }
        </SignalConsumer>
      </ul>
    </div>
  )
}
