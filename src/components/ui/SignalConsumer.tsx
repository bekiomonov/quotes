'use client'

import { Target, useSignalConsumer } from '@hooks'
import { ReactNode } from 'react'

type Props<Snapshot> = {
  signal: Target<Snapshot>
  children: ({ value, signal }: { value: Snapshot; signal: Target<Snapshot> }) => ReactNode
}

export function SignalConsumer<Snapshot>({ children, signal }: Props<Snapshot>) {
  const value = useSignalConsumer(signal, signal.getValue)

  return children({ value: value.state, signal })
}
