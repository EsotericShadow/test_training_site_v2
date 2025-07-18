import Script from 'next/script';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/app/components/layout/header';
import Footer from '@/app/components/layout/footer';
import { ThemeProvider } from './components/theme/smart-theme-provider';
import Silk from '@/app/components/ui/Silk';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

// Your actual Google Analytics 4 Measurement ID
const GA_MEASUREMENT_ID = 'G-W6X7SX4VF0';

export const metadata: Metadata = {
  title: 'Karma Training - Premier Safety Training for Northwestern BC',
  description: 'Professional safety training courses including KIST Orientation, WHMIS, Fall Protection, and more. Serving Northwestern British Columbia with expert instruction and certification.',
  keywords: 'safety training, KIST, WHMIS, fall protection, Northwestern BC, workplace safety, certification',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Viewport meta tag for mobile responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Google Analytics 4 - Your actual tracking code */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col text-black dark:text-white transition-colors duration-300 relative z-0">
            <div className="fixed inset-0 z-[-1]">
              <Silk color="#303E5A" />
            </div>
            <Header />
            <main className="flex-grow pt-24 relative z-10">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
        {/* Keep Vercel Analytics too - they work great together */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}