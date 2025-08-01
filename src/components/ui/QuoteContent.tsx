'use client'

import { dummyjsonApi, DummyJsonQuote, realinspireApi, RealinspireQuote } from '@api'
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Loader,
  Rating,
  RatingButton,
} from '@components/core'
import { useConnectionStatus, useSignal } from '@hooks'
import { quoteStorage } from '@lib/quoteStorage'
import { cn } from '@lib/utils'
import { Quote } from '@schema'
import AutoplayPlugin from 'embla-carousel-autoplay'
import { HeartIcon, ZapIcon } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SignalConsumer } from './SignalConsumer'

function getPromises() {
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
          source: process.env.NEXT_PUBLIC_DUMMYJSON_API!,
          rating: 0,
          isFavorite: false,
        })),
      realinspireApi
        .get<RealinspireQuote>('/random', {
          init: {},
          beforeRequest: (controller) => {
            controllers.push(controller)
          },
        })
        .then((res) => ({
          author: res[0].author,
          content: res[0].content,
          id: Buffer.from(res[0].content, 'utf8').toString('base64'),
          source: process.env.NEXT_PUBLIC_REALINSPIRE_API!,
          rating: 0,
          isFavorite: false,
        })),
    ],
    controllers,
  }
}

export function QuoteContent() {
  const signal = useSignal<(Quote & { fromCache: boolean })[]>([])
  const slidesLength = useRef(0)
  const isFetching = useRef(false)
  const isOnline = useConnectionStatus()
  const quoteIdMap = useRef<Record<number | string, boolean>>({})
  const [emblaApi, setEmblaApi] = useState<CarouselApi | null>(null)
  const autoplay = useRef(AutoplayPlugin({ stopOnMouseEnter: true }))

  async function fetchQuote() {
    const { promises, controllers } = getPromises()

    return await Promise.any(promises).then((res) => {
      controllers.forEach((controller) => {
        controller.abort()
      })
      return res
    })
  }

  function setToState(quote: Quote, fromCache: boolean = false) {
    signal((draft) => {
      draft.push({
        author: quote.author,
        content: quote.content,
        id: quote.id,
        source: quote.source,
        fromCache,
        rating: quote.rating,
        isFavorite: quote.isFavorite,
      })
    })
    quoteStorage.setQuote(quote)
  }

  const slidesInView = useCallback(
    (api: CarouselApi) => {
      if (api) {
        const slidesInView = api.slidesInView()
        if (slidesInView.length === 1) {
          const isLast = slidesInView[0] === slidesLength.current
          if (isLast && !isFetching.current) {
            if (isOnline) {
              isFetching.current = true
              fetchQuote()
                .then((res) => {
                  if (quoteIdMap.current[res.id]) {
                    console.log('Already on the list: ', res.id)
                  } else if (res) {
                    slidesLength.current = slidesInView[0] + 1
                    quoteIdMap.current[res.id] = true
                    setToState(res)
                  }
                })
                .finally(() => {
                  isFetching.current = false
                })
            } else {
              const randomQuoteFromStorage = quoteStorage.getRandom()
              if (randomQuoteFromStorage && !quoteIdMap.current[randomQuoteFromStorage.id]) {
                slidesLength.current = slidesInView[0] + 1
                quoteIdMap.current[randomQuoteFromStorage.id] = true
                setToState(randomQuoteFromStorage, true)
              } else {
                console.log('Already on the list: ', randomQuoteFromStorage?.id)
              }
            }
          }
        } else if (!api.slidesInView().length && isOnline) {
          fetchQuote().then((res) => {
            quoteIdMap.current[res.id] = true
            setToState(res)
          })
        }
      }
    },
    [isOnline]
  )

  const setApiCb = useCallback(
    (api: CarouselApi) => {
      if (api) {
        setEmblaApi(api)
      }
    },
    [isOnline]
  )

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('slidesInView', slidesInView)
      emblaApi.emit('slidesInView')
      return () => {
        emblaApi.off('slidesInView', slidesInView)
      }
    }
  }, [emblaApi, isOnline])

  function onRatingChange(id: string | number, value: number) {
    quoteStorage.updateRating(id, value)

    signal((draft) => {
      const index = draft.findIndex((it) => it.id === id)
      if (index > -1) {
        draft[index].rating = value
      }
    })
  }

  function toggleQuoteLike(id: string | number, value: boolean) {
    quoteStorage.updateLike(id, value)
    signal((draft) => {
      const index = draft.findIndex((it) => it.id === id)
      if (index > -1) {
        draft[index].isFavorite = value
      }
    })
  }

  return (
    <Carousel plugins={[autoplay.current]} setApi={setApiCb} className='w-full max-w-3xl'>
      <SignalConsumer signal={signal}>
        {({ value: slides }) => {
          return (
            <>
              {!slides.length ? (
                <div className='flex items-center justify-center'>
                  <Loader size='lg' />
                </div>
              ) : null}
              <CarouselContent className={cn(!slides.length && 'sr-only')}>
                {slides.map((item) => (
                  <CarouselItem key={item.id} data-testid='slide'>
                    <div className='p-1'>
                      <Card>
                        <CardHeader>
                          <div className='flex items-center justify-between'>
                            {item.fromCache ? (
                              <span className='text-muted-foreground'>
                                <ZapIcon className='size-4' />
                              </span>
                            ) : null}
                            <Button
                              variant='ghost'
                              className='text-muted-foreground ml-auto cursor-pointer'
                              onClick={() => {
                                toggleQuoteLike(item.id, !item.isFavorite)
                              }}
                            >
                              <HeartIcon className={cn('size-4', item.isFavorite && 'fill-current')} />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className='flex aspect-[2] items-center justify-center p-6'>
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
                          <span className='text-muted-foreground ml-auto'>{item.source}</span>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {slides.length ? (
                <div className='flex gap-2 mt-3'>
                  <CarouselPrevious data-testid='previous-btn' />
                  <CarouselNext
                    data-testid='next-btn'
                    onScrollNext={() => {
                      console.log('Click')
                    }}
                  />
                </div>
              ) : null}
            </>
          )
        }}
      </SignalConsumer>
    </Carousel>
  )
}
