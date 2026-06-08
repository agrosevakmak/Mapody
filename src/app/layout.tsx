import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mapody - Turn Google Maps Links Into Websites',
  description: 'Transform any Google Maps business listing into a beautiful, ready-to-publish website in seconds. AI-powered content generation, custom themes, and one-click publishing.',
  keywords: ['google maps', 'website builder', 'business website', 'AI', 'maps to website', 'landing page generator'],
  openGraph: {
    title: 'Mapody - Turn Google Maps Links Into Websites',
    description: 'Paste a Google Maps link. Get a beautiful website in 60 seconds.',
    images: ['/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mapody - Turn Google Maps Links Into Websites',
    description: 'Paste a Google Maps link. Get a beautiful website in 60 seconds.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = JSON.parse(localStorage.getItem('mapody-theme') || '{}');
                if (t.darkMode) document.documentElement.classList.add('dark');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
