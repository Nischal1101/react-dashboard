'use client'

import { useEffect, useRef } from 'react'

import { Input } from '@/components/ui/input'
import { formatPhone, parsePhone } from '@/lib/utils'
import type { TEditableCellRenderProps } from '@/@types'

export function PhoneCell({
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
      ref.current.select()
    }
  }, [autoFocus])

  return (
    <Input
      ref={ref}
      type="tel"
      inputMode="tel"
      value={formatPhone(value ?? '')}
      placeholder={meta.placeholder ?? '(555) 123-4567'}
      aria-invalid={Boolean(error)}
      onChange={(e) => onChange(parsePhone(e.target.value))}
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
