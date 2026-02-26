import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Poppins } from 'next/font/google';
import './globals.css';
import { QueryProvider } from './_shared/providers/query-provider';
import { ToasterProvider } from './_shared/providers/toaster';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "CloudTrack Campus",
    template: "%s | CloudTrack Campus",
  },
  description:
    "CloudTrack Campus untuk praktikum komputasi awan, dimulai dari Modul 1 presensi QR dinamis.",
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
    apple: "/images/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`surface-base min-h-screen flex flex-col ${poppins.className}`}
      >
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
      </body>
    </html>
  );
}
