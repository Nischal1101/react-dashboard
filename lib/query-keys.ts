function createKeys(tag: string) {
  return {
    list: () => [tag],
    bySlug: (id: string) => [tag, id],
    byFilter: <T>(filters: T) => [tag, "filter", filters],
    filterOptions: () => [tag, "filter-options"],
  };
}

export const keys = {
  products: createKeys("products"),
} as const;
