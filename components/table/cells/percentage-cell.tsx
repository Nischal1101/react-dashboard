'use client'

import { useEffect, useRef, useState } from 'react'

import { Input } from '@/components/ui/input'
import type { TEditableCellRenderProps } from '@/@types'

export function formatPercentage(
  value: number | null | undefined,
  locale = 'en-US',
): string {
  if (value == null || Number.isNaN(value)) return ''
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value)}%`
}

export function parsePercentage(raw: string): number | null {
  if (raw == null || raw === '') return null
  const cleaned = raw.replace(/[^0-9.\-]/g, '')
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : NaN
}

export function PercentageCell({
  value,
  meta,
  error,
  autoFocus,
  onChange,
  onCommit,
  onCancel,
}: TEditableCellRenderProps<unknown, number | null>) {
  const ref = useRef<HTMLInputElement>(null)
  const [text, setText] = useState<string>(value == null ? '' : String(value))

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus()
      ref.current.select()
    }
  }, [autoFocus])

  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={text}
        placeholder={meta.placeholder ?? '0'}
        aria-invalid={Boolean(error)}
        className="pr-6 text-right"
        onChange={(e) => {
          setText(e.target.value)
          onChange(parsePercentage(e.target.value))
        }}
        onBlur={() => {
          const n = parsePercentage(text)
          if (n != null && Number.isFinite(n)) setText(String(n))
        }}
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
      <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
        %
      </span>
    </div>
  )
}
