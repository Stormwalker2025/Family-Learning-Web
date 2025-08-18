import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Family Learning Hub',
  description:
    'Australian Family Learning & Homework Platform for August (Year 3) and Michael (Year 6)',
  keywords: [
    'education',
    'homework',
    'australia',
    'year 3',
    'year 6',
    'learning',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-AU">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
