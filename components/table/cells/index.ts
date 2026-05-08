import type { TCellRegistry, TEditableCellRenderer } from "@/@types";

import { CheckboxCell } from "./checkbox-cell";
import { CurrencyCell } from "./currency-cell";
import { DateCell } from "./date-cell";
import { NumberInputCell } from "./number-input-cell";
import { PercentageCell } from "./percentage-cell";
import { PhoneCell } from "./phone-cell";
import { SelectCell } from "./select-cell";
import { TextCell } from "./text-cell";

export const defaultCellRegistry: TCellRegistry = {
  text: TextCell as TEditableCellRenderer,
  number: NumberInputCell as TEditableCellRenderer,
  select: SelectCell as TEditableCellRenderer,
  checkbox: CheckboxCell as TEditableCellRenderer,
  date: DateCell as TEditableCellRenderer,
  phone: PhoneCell as TEditableCellRenderer,
  currency: CurrencyCell as TEditableCellRenderer,
  percentage: PercentageCell as TEditableCellRenderer,
};

export {
  TextCell,
  NumberInputCell,
  SelectCell,
  CheckboxCell,
  DateCell,
  PhoneCell,
  CurrencyCell,
  PercentageCell,
};
