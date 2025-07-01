import { Subscriber, Target } from '@/hooks'
import { produce } from 'immer'
import { nanoid } from 'nanoid'

export const createSignal = <T>(
  defaultValue: T,
  name?: string,
  onUpdate?: (props: { target?: Target<T>; key?: string | symbol; newValue?: T }) => void
) => {
  const subscribers: Record<string, Subscriber<T>> = {}
  const target: Target<T> = (callback?: (value: T) => T | void) => {
    if (callback) {
      const produced = produce(target.getValue(), callback)
      target.value = produced
      if (onUpdate) {
        onUpdate({ target, newValue: produced })
      }
      Object.keys(subscribers).forEach((key) => {
        const subscriber = subscribers[key]
        subscriber(target.getValue())
      })

      return produced
    }
  }

  target.value = defaultValue
  target.getValue = () => target.value
  target.getServerSnapshot = () => target.value
  target.pureSubscribe = (listener) => {
    const id = nanoid()
    subscribers[id] = listener
    return () => {
      return delete subscribers[id]
    }
  }
  target.subscribe = (subscriber) => {
    const id = nanoid()
    subscribers[id] = subscriber
    return id
  }
  target.unsubscribe = (id: string) => {
    return delete subscribers[id]
  }
  target.signalName = name

  const signal = new Proxy(target, {
    get(target, key) {
      if (key === 'pureSubscribe') return target.pureSubscribe
      if (key === 'getServerSnapshot') return target.getServerSnapshot
      if (key === 'subscribe') return target.subscribe
      if (key === 'getValue') return target.getValue
      if (key === 'signalName') return target.signalName
      if (key === 'value' || key === 'subscribe' || key === 'unsubscribe') return target[key]
    },
    set(target, key, newValue: T) {
      if (onUpdate) {
        onUpdate({ target, key, newValue })
      }
      if (key !== 'value') return true
      if (typeof newValue !== 'function' && Object.is(target[key], newValue)) return true

      target[key] = newValue
      Object.keys(subscribers).forEach((key) => {
        const subscriber = subscribers[key]
        subscriber(newValue)
      })

      return true
    },
  })

  return signal
}
