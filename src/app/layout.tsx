import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/app/components/layout/header'
import Footer from '@/app/components/layout/footer'

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
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}