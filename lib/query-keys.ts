function createKeys(tag: string) {
  return {
    list: () => [tag],
    bySlug: (id: string) => [tag, id],
    byFilter: (filters: Record<string, unknown>) => [tag, "filter", filters],
  };
}

export const keys = {
  
} as const;
