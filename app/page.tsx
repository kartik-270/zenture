'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { QuickLinks } from '@/components/quick-links';
import { PlatformFeatures } from '@/components/platform-features';
import { Footer } from '@/components/footer';
import { DailyCheckIn } from '@/components/DailyCheckIn';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        <DailyCheckIn />

        <QuickLinks />
        <PlatformFeatures />
      </main>

      <Footer />
    </div>
  );
}
