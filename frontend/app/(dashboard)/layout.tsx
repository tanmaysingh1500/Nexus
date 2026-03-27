import { Suspense } from 'react';
import { Navigation } from '@/components/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="nexus-shell flex min-h-screen flex-col">
      <Suspense fallback={<div className="h-16 border-b border-gray-200" />}>
        <Navigation />
      </Suspense>
      <main className="flex-1">
        {children}
      </main>
    </section>
  );
}
