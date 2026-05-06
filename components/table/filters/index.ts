import type { FilterRegistry, FilterRenderer } from "@/@types";

import { NumberFilter } from "./number-filter";
import { SelectFilter } from "./select-filter";
import { TextFilter } from "./text-filter";

export const defaultFilterRegistry: FilterRegistry = {
  text: TextFilter as FilterRenderer,
  number: NumberFilter as FilterRenderer,
  select: SelectFilter as FilterRenderer,
};

export { TextFilter, NumberFilter, SelectFilter };
