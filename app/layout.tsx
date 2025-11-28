/**
 * Root Layout
 * Configures fonts, metadata, and global providers
 */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: {
    default: 'YouTube Knowledge Extractor',
    template: '%s | YouTube Knowledge Extractor',
  },
  description: 'Convert YouTube videos into clear learning notes with AI-powered summarization',
  keywords: ['youtube', 'video', 'summary', 'ai', 'transcript', 'knowledge', 'learning'],
  authors: [{ name: 'YouTube Knowledge Extractor' }],
  creator: 'YouTube Knowledge Extractor',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'YouTube Knowledge Extractor',
    description: 'Convert YouTube videos into clear learning notes with AI-powered summarization',
    siteName: 'YouTube Knowledge Extractor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Knowledge Extractor',
    description: 'Convert YouTube videos into clear learning notes with AI-powered summarization',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>
        
        <div id="main-content">
          {children}
        </div>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
