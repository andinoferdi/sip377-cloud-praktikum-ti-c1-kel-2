import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Poppins } from 'next/font/google';
import './globals.css';
import { QueryProvider } from './_shared/providers/query-provider';
import { AuthSessionProvider } from './_shared/providers/session-provider';
import { ToasterProvider } from './_shared/providers/toaster';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SIPOS',
    template: '%s | SIPOS',
  },
  description:
    'SIPOS platform for operational POS management, sales flow, and outlet administration.',
  icons: {
    icon: '/images/favicon.ico',
    shortcut: '/images/favicon.ico',
    apple: '/images/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`surface-base min-h-screen flex flex-col ${poppins.className}`}
      >
        <AuthSessionProvider>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <ToasterProvider />
              <div className="isolate flex flex-col flex-1">{children}</div>
            </QueryProvider>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
