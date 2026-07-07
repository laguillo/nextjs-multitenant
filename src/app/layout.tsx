import type { Metadata } from 'next';
import './globals.css';
import { fontSans, fontMono } from '@/lib/fonts';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: {
    default: 'Next.js Multi-Tenant SaaS Starter',
    template: '%s | Next.js Multi-Tenant SaaS Starter'
  },
  description:
    'A starter template for building a multi-tenant SaaS application with Next.js, TypeScript, and Tailwind CSS.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          fontSans.variable,
          fontMono.variable,
          'font-sans antialiased'
        )}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
