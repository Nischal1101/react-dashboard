'use client'

import { useEffect, useRef } from 'react'

import { Input } from '@/components/ui/input'
import type { TEditableCellRenderProps } from '@/@types'

export function DateCell({
  value,
  meta,
  error,
  autoFocus,
  onChange,
  onCommit,
  onCancel,
}: TEditableCellRenderProps<unknown, string>) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus()
    }
  }, [autoFocus])

  return (
    <Input
      ref={ref}
      type="date"
      value={value ?? ''}
      placeholder={meta.placeholder}
      aria-invalid={Boolean(error)}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onCommit()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          onCancel()
        }
      }}
    />
  )
}
