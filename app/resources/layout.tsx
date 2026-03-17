import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zenture Wellness',
  description: 'A comprehensive platform for mental wellness.',
  openGraph: {
     title: 'Zenture Wellness',
     description: 'A comprehensive platform for mental wellness.',
     images: ['/og-image.png'],
  }
}

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
