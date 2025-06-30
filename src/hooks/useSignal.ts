import { useLatest } from '@hooks'
import { createSignal } from '@lib/createSignal'
import { useEffect, useMemo, useState } from 'react'

const isFunction = (arg: any): arg is (arg: any) => any => typeof arg === 'function'

export type Subscriber<T> = (value: T) => void
export type Signal<T> = T extends ReturnType<typeof createSignal<T>> ? T : never

export type Target<T> = {
  value: T
  getValue: () => T
  getServerSnapshot: () => T
  subscribe: (subscriber: Subscriber<T>) => string
  pureSubscribe: (subscriber: Subscriber<T>) => () => void
  unsubscribe: (id: string) => boolean
  signalName?: string
  (draft?: (value: T) => T | void): void
}

export const useSignal = <T>(
  defaultValue: T | (() => T), //extends (() => infer Initial) ? T : T,
  name?: string,
  onUpdate?: (props: { target?: Target<T>; key?: string | symbol; newValue?: T }) => void
) => {
  const latestDefaultValue = useLatest(defaultValue)
  const signal = useMemo(
    () =>
      createSignal(
        typeof latestDefaultValue.current === 'function'
          ? (latestDefaultValue.current as () => T)()
          : latestDefaultValue.current,
        name,
        onUpdate
      ),
    []
  )

  return signal
}

export type Updater<T, G = T> = (value: T) => G | ((value: T) => G)

export const useSignalConsumer = <T, G = T>(signal: Target<T>, updater?: Updater<T, G>) => {
  const isUpdater = (callback: G | ((value: T) => G)): callback is (value: T) => G => {
    return typeof callback === 'function'
  }

  const [state, setState] = useState<T | G>(
    updater
      ? () => {
          const returned = updater(signal.value)
          if (isFunction(returned)) {
            return returned(signal.value)
          }
          return returned
        }
      : () => signal.value
  )
  const subscriber = useLatest(
    updater
      ? (value: T) => {
          return setState((prevState) => {
            const returned = updater(value)
            if (isUpdater(returned)) {
              return returned(prevState as T)
            }
            return returned
          })
        }
      : setState
  )
  useEffect(() => {
    const id = signal.subscribe(subscriber.current)

    return () => {
      signal.unsubscribe(id)
    }
  }, [])

  return { state, signal }
}
