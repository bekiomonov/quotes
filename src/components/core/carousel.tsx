'use client'

import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/core/button'
import { cn } from '@/lib/utils'

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  // const onScroll = React.useCallback((emblaApi: CarouselApi) => {
  //   if (!listenForScrollRef.current) return

  //   setLoadingMore((loadingMore) => {
  //     if (emblaApi) {
  //       const lastSlide = emblaApi.slideNodes().length - 1
  //       const lastSlideInView = emblaApi.slidesInView().includes(lastSlide)
  //       const loadMore = !loadingMore && lastSlideInView

  //       if (loadMore) {
  //         listenForScrollRef.current = false

  //         onScrolling && onScrolling()
  //         mockApiCall(1000, 2000, () => {
  //           setSlides((currentSlides) => {
  //             if (currentSlides.length === 20) {
  //               setHasMoreToLoad(false)
  //               emblaApi.off('scroll', scrollListenerRef.current)
  //               return currentSlides
  //             }
  //             const newSlideCount = currentSlides.length + 5
  //             return Array.from(Array(newSlideCount).keys())
  //           })
  //         })
  //       }

  //       return loadingMore || lastSlideInView
  //     }
  //     return false
  //   })
  // }, [])

  React.useEffect(() => {
    if (api && setApi) {
      setApi(api)
    }
  }, [api, setApi])

  React.useEffect(() => {
    if (api) {
      onSelect(api)
      api.on('reInit', onSelect)
      api.on('select', onSelect)
    }

    return () => {
      api?.off('select', onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        // onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role='region'
        aria-roledescription='carousel'
        data-slot='carousel'
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className='overflow-hidden' data-slot='carousel-content'>
      <div className={cn('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)} {...props} />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<'div'>) {
  const { orientation } = useCarousel()

  return (
    <div
      role='group'
      aria-roledescription='slide'
      data-slot='carousel-item'
      className={cn('min-w-0 shrink-0 grow-0 basis-full', orientation === 'horizontal' ? 'pl-4' : 'pt-4', className)}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = 'outline',
  size = 'icon',
  onScrollPrev,
  ...props
}: React.ComponentProps<typeof Button> & { onScrollPrev?: () => void }) {
  const { scrollPrev, canScrollPrev } = useCarousel()
  return (
    <Button
      data-slot='carousel-previous'
      variant={variant}
      size={size}
      className={cn('size-8 rounded-full', className)}
      disabled={!canScrollPrev}
      onClick={() => {
        scrollPrev()
        if (onScrollPrev) {
          onScrollPrev()
        }
      }}
      {...props}
    >
      <ArrowLeft />
      <span className='sr-only'>Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = 'outline',
  size = 'icon',
  onScrollNext,
  ...props
}: React.ComponentProps<typeof Button> & { onScrollNext?: () => void }) {
  const { scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot='carousel-next'
      variant={variant}
      size={size}
      className={cn('size-8 rounded-full', className)}
      disabled={!canScrollNext}
      onClick={() => {
        scrollNext()
        if (onScrollNext) {
          onScrollNext()
        }
      }}
      {...props}
    >
      <ArrowRight />
      <span className='sr-only'>Next slide</span>
    </Button>
  )
}

export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel, type CarouselApi }
