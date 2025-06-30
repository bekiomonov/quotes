'use client'

import { Target, useSignalConsumer } from '@hooks'
import { ReactNode } from 'react'

type Props<Snapshot extends Selection, Selection> = {
  signal: Target<Snapshot>
  selector: (snapshot: Snapshot) => Selection
  children: ({ value, signal }: { value: Selection; signal: Target<Snapshot> }) => ReactNode
  name?: string
  id?: string
}

export function SignalConsumerWithSelector<Snapshot extends Selection, Selection>({
  children,
  signal,
  selector,
}: Props<Snapshot, Selection>) {
  const value = useSignalConsumer(signal, (selection) => (selector ? selector(selection) : selection))

  return children({ value: value.state, signal })
}
