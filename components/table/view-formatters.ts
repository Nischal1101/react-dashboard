import { formatNumber } from "@/lib/utils";
import type { TEditableColumnMeta, TSelectOption } from "@/@types";

import { formatCurrency } from "./cells/currency-cell";
import { formatPercentage } from "./cells/percentage-cell";
import { formatPhone } from "./cells/phone-cell";

export function formatViewValue(
  value: unknown,
  meta?: TEditableColumnMeta,
): string {
  if (value === null || value === undefined || value === "") return "—";

  const fieldType = meta?.fieldType ?? "text";

  switch (fieldType) {
    case "number":
      return formatNumber(value as number | string);
    case "currency":
      return formatCurrency(
        value as number,
        meta?.currency ?? "USD",
        meta?.locale ?? "en-US",
      );
    case "percentage":
      return formatPercentage(value as number, meta?.locale ?? "en-US");
    case "phone":
      return formatPhone(String(value));
    case "select": {
      const options: TSelectOption[] = meta?.options ?? [];
      return options.find((o) => o.value === value)?.label ?? String(value);
    }
    case "date":
      return String(value);
    case "checkbox":
      return value ? "Yes" : "No";
    case "text":
    default:
      return String(value);
  }
}
