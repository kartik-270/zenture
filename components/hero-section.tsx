"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Heart, Shield } from "lucide-react";

export function HeroSection() {
  const router = useRouter();
  return (
    <section className="relative min-h-[85vh] gradient-bg overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-cyan-100/40 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-cyan-100">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-medium text-slate-700">Your wellness journey starts here</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Bridging the Gap:{" "}
                <span className="bg-gradient-to-r from-cyan-500 to-cyan-700 bg-clip-text text-transparent">
                  Mental Wellness
                </span>{" "}
                {/* for College Students */}
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 max-w-xl leading-relaxed">
                Positive mental health is helping people live happier, healthier and longer lives.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => {
                  const token = localStorage.getItem('authToken');
                  const role = localStorage.getItem('userRole');
                  
                  if (!token) {
                    router.push('/signup');
                    return;
                  }

                  if (role === 'admin') {
                    router.push('/admin/dashboard');
                  } else if (role === 'counselor' || role === 'counsellor') {
                    router.push('/counsellor');
                  } else {
                    router.push('/dashboard');
                  }
                }}
                className="bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-cyan-200/50 transition-all hover:scale-105"
              >
                Start your Journey Today
              </Button>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg font-semibold border-2 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 transition-all"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">24/7</p>
                  <p className="text-sm text-slate-500">Support Available</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">100%</p>
                  <p className="text-sm text-slate-500">Confidential</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Brain Illustration */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-lg aspect-square">
              {/* Animated rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-cyan-200/50 animate-spin-slow" />
              </div>
              <div className="absolute inset-8 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-cyan-300/50 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }} />
              </div>
              <div className="absolute inset-16 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-cyan-400/50 animate-spin-slow" style={{ animationDuration: '16s' }} />
              </div>
              
              {/* Center brain icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-2xl shadow-cyan-300/50 flex items-center justify-center animate-float">
                  <Brain className="w-24 h-24 sm:w-32 sm:h-32 text-white" strokeWidth={1.5} />
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute top-8 right-0 bg-white rounded-2xl shadow-lg px-4 py-3 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Self-Care</span>
                </div>
              </div>

              <div className="absolute bottom-8 left-0 bg-white rounded-2xl shadow-lg px-4 py-3 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Mindfulness</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
