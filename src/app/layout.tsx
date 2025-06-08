import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/app/components/layout/header'
import Footer from '@/app/components/layout/footer'
import { ThemeProvider } from './components/theme/smart-theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Karma Training - Premier Safety Training for Northwestern BC',
  description: 'Professional safety training courses including KIST Orientation, WHMIS, Fall Protection, and more. Serving Northwestern British Columbia with expert instruction and certification.',
  keywords: 'safety training, KIST, WHMIS, fall protection, Northwestern BC, workplace safety, certification',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
            <Header />
            <main className="flex-grow pt-42 md:pt-38">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

