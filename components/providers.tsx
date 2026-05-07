"use client";

import {
  matchQuery,
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState } from "react";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/sonner";

type ProviderProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProviderProps) {
  const [queryClient] = useState(() => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          retry: false,
          staleTime: 1000 * 60 * 15, // 15 minutes
        },
        mutations: {
          retry: false,
        },
      },
      mutationCache: new MutationCache({
        onSuccess: (_data, _variables, _context, mutation: any) => {
          queryClient.invalidateQueries({
            predicate: (query) =>
              mutation.meta?.invalidates?.some((queryKey: any) =>
                matchQuery({ queryKey }, query),
              ),
          });
        },
      }),
    });

    return queryClient;
  });

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
        </QueryClientProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
