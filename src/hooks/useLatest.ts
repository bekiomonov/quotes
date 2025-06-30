'use client'

import { useEffect, useRef } from 'react'

export function useLatest<Value>(value: Value) {
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  return valueRef
}
