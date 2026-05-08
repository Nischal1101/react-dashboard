'use client'

import { useEffect, useRef } from 'react'

import { Input } from '@/components/ui/input'
import type { TEditableCellRenderProps } from '@/@types'

export function formatPhone(raw: string): string {
  const digits = (raw ?? '').replace(/\D/g, '').slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length < 4) return `(${digits}`
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function parsePhone(formatted: string): string {
  return (formatted ?? '').replace(/\D/g, '').slice(0, 10)
}

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
