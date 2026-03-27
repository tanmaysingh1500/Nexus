'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { DemoProvider } from './demo/DemoContext';
import { DemoOverlay } from '@/components/demo/DemoOverlay';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 3,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <DemoProvider>
          {children}
          <DemoOverlay />
          <Toaster richColors position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </DemoProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
