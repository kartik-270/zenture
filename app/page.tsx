'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { QuickLinks } from '@/components/quick-links';
import { PlatformFeatures } from '@/components/platform-features';
import { Footer } from '@/components/footer';
import { MoodCheckinModal } from '@/components/mood-checkin-modal';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { apiConfig } from '@/lib/config';
import { getAuthToken } from '@/lib/auth';

export default function Home() {
  const [isMoodCheckInOpen, setIsMoodCheckInOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [mounted, setMounted] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [latestMood, setLatestMood] = useState<any>(null);
  const [checkinCount, setCheckinCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();

    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-changed', handleStorageChange);
    };
  }, []);

  const checkAuthStatus = () => {
    if (typeof window === 'undefined') return;
    const token = getAuthToken();
    const role = localStorage.getItem('userRole');
    setIsLoggedIn(!!token);
    setUserRole(role || '');
    
    if (token) {
      checkMoodStatus(token);
    }
  };

  const checkMoodStatus = async (token: string) => {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/mood-checkin/today-status`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHasCheckedInToday(data.hasCheckedIn);
        setCheckinCount(data.count || 0);
        setLatestMood(data.latest || null);
      }
    } catch (error) {
      console.error("Error checking mood status:", error);
    }
  };

  const getDashboardUrl = () => {
    if (userRole === 'admin') return '/admin/dashboard';
    if (userRole === 'counselor') return '/counselor';
    return '/dashboard';
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        {/* Mood Check-in Section for Logged In Users */}
        {isLoggedIn && (
          <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 text-blue-600 font-bold text-[10px] uppercase tracking-wider mb-4">
                    <Sparkles size={12} className="animate-pulse" />
                    {hasCheckedInToday ? "Daily Journey" : "Self-Care Daily"}
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {hasCheckedInToday ? "Is there any mood change?" : "How are you feeling today?"}
                  </h2>
                  <p className="text-slate-600 mb-6">
                    {hasCheckedInToday 
                      ? (latestMood?.analysis ? `"${latestMood.analysis}"` : `You've logged ${checkinCount} mood${checkinCount !== 1 ? 's' : ''} today. Each data point helps refine your wellness journey.`)
                      : "Take a quick mood check-in to help us personalize your wellness experience. Your insights help us provide better support."
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => setIsMoodCheckInOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-3 flex items-center gap-2"
                    >
                      {hasCheckedInToday ? "Update Mood" : "Start Mood Check-in"}
                      <ArrowRight size={18} />
                    </Button>
                    <Link href={getDashboardUrl()}>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto rounded-full px-8 py-3"
                      >
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex-1 hidden sm:flex items-center justify-center">
                  <div className="relative w-full max-w-xs">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-2xl opacity-50"></div>
                    <div className="relative bg-white rounded-full p-12 shadow-lg flex items-center justify-center">
                      <div className="text-6xl">{hasCheckedInToday ? "🌟" : "🧘"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Call-to-Action for Non-Logged In Users */}
        {!isLoggedIn && (
          <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Ready to prioritize your mental wellness?
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Join thousands of students who are taking charge of their mental health with Zenture Wellness. Track your mood, connect with counselors, and access personalized resources.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white rounded-full px-8 py-3 w-full sm:w-auto">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="outline"
                    className="rounded-full px-8 py-3 w-full sm:w-auto"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        <QuickLinks />
        <PlatformFeatures />
      </main>

      {/* Mood Check-in Modal */}
      <MoodCheckinModal
        isOpen={isMoodCheckInOpen}
        onClose={() => setIsMoodCheckInOpen(false)}
        onSuccess={(summary) => {
          checkAuthStatus();
          console.log('Mood check-in completed:', summary);
        }}
        isSimplified={true}
      />

      <Footer />
    </div>
  );
}
