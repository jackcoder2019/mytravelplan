import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AmplifyProvider } from '@/components/AmplifyProvider'

export const metadata: Metadata = {
  title: 'Travel Planner',
  description: 'Plan your trip day by day',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-navy-deep text-gray-100 min-h-screen">
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  )
}
