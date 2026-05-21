'use client';
import React, { useState } from "react";
import { QueryClient, QueryClientProvider, hydrate } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function QueryProviderClient({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState?: unknown;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );
  if (dehydratedState) {
    // apply server-side dehydrated cache to the client query store
    try {
      // hydrate mutates the queryClient in place
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hydrate(queryClient as any, dehydratedState as any);
    } catch {
      // ignore hydrate errors during client render
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}

