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
