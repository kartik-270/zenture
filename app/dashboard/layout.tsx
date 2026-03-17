import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wellness Dashboard | Zenture Wellness',
  description: 'Track your mood, manage appointments, and access personalized wellness resources in your private dashboard.',
  openGraph: {
    title: 'Your Wellness Dashboard | Zenture Wellness',
    description: 'Empowering your mental health journey with AI-driven insights and support.',
    images: ['/og-image.png'],
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
