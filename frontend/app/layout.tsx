import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { Providers } from '@/lib/providers';
import { DevModeIndicator } from '@/components/dev-mode-indicator';

export const metadata: Metadata = {
  title: 'Nexus',
  description: 'Nexus AI on-call command center for incident response, autonomous remediation, and infrastructure intelligence.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.className} suppressHydrationWarning>
      <body className="min-h-[100dvh] antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          <DevModeIndicator />
        </Providers>
      </body>
    </html>
  );
}
