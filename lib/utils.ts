import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | string | undefined) {
  if (value === null || value === undefined || value === "") return "";

  if (typeof value === "string") {
    value = parseFloat(value);
  }

  if (Number.isNaN(value)) return "";

  const fractionDigits = Math.floor(value) === value ? 0 : 2;

  return value.toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatCurrency(
  value: number | null | undefined,
  currency = "USD",
  locale = "en-US",
): string {
  if (value == null || Number.isNaN(value)) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseCurrency(raw: string): number | null {
  if (raw == null || raw === "") return null;
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export function formatPercentage(
  value: number | null | undefined,
  locale = "en-US",
): string {
  if (value == null || Number.isNaN(value)) return "";
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

export function parsePercentage(raw: string): number | null {
  if (raw == null || raw === "") return null;
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export function formatPhone(raw: string): string {
  const digits = (raw ?? "").replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function parsePhone(formatted: string): string {
  return (formatted ?? "").replace(/\D/g, "").slice(0, 10);
}
