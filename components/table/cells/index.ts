import type { CellRegistry, EditableCellRenderer } from "@/@types";

import { CheckboxCell } from "./checkbox-cell";
import { CurrencyCell } from "./currency-cell";
import { DateCell } from "./date-cell";
import { NumberInputCell } from "./number-input-cell";
import { PercentageCell } from "./percentage-cell";
import { PhoneCell } from "./phone-cell";
import { SelectCell } from "./select-cell";
import { TextCell } from "./text-cell";

export const defaultCellRegistry: CellRegistry = {
  text: TextCell as EditableCellRenderer,
  number: NumberInputCell as EditableCellRenderer,
  select: SelectCell as EditableCellRenderer,
  checkbox: CheckboxCell as EditableCellRenderer,
  date: DateCell as EditableCellRenderer,
  phone: PhoneCell as EditableCellRenderer,
  currency: CurrencyCell as EditableCellRenderer,
  percentage: PercentageCell as EditableCellRenderer,
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
