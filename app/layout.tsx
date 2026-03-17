import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AiChatBubble } from '@/components/ai-chat-bubble'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Zenture Wellness - Mental Health for College Students',
  description: 'Bridging the Gap: Mental Wellness for College Students. Access counseling, self-help resources, peer support, and wellness tools in one place.',
  generator: 'v0.app',
  metadataBase: new URL('https://zenture.duckdns.org'), // Assuming this is the base URL from previous context
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Zenture Wellness - Mental Health for College Students',
    description: 'Transforming college life with better mental health. Access expert counseling and community support tailored for students.',
    url: 'https://zenture.duckdns.org',
    siteName: 'Zenture Wellness',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zenture Wellness - Mental Health Companion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zenture Wellness - Mental Health for College Students',
    description: 'Bridging the Gap: Mental Wellness for College Students. Access counseling and peer support.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <AiChatBubble />
        <Analytics />
      </body>
    </html>
  )
}
