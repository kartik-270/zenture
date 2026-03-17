"use client";

import Link from "next/link";
import { Shield, HelpCircle, TrendingUp, Bot, Brain, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const analyticsData = [
  { label: "Stress", percentage: 65, color: "bg-orange-400" },
  { label: "Anxiety", percentage: 45, color: "bg-amber-400" },
  { label: "Happiness", percentage: 78, color: "bg-green-400" },
];

export function PlatformFeatures() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Platform Features and Impacts
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive tools designed to support your mental wellness journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          {/* Left Features */}
          <div className="space-y-6">
            <Link href="/confidential">
              <div className="group flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:border-cyan-200 transition-all duration-300 cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-cyan-700 transition-colors">
                    Confidential & Safe
                  </h3>
                  <p className="text-sm text-slate-500">
                    Your data is encrypted and protected
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/faq">
              <div className="group flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:border-cyan-200 transition-all duration-300 cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-cyan-700 transition-colors">
                    FAQs & Help
                  </h3>
                  <p className="text-sm text-slate-500">
                    Get answers to common questions
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Center - Brain Illustration */}
          <div className="relative flex items-center justify-center py-8">
            <div className="relative">
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center">
                <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-br from-cyan-200 to-cyan-300 flex items-center justify-center">
                  <Brain className="w-24 h-24 sm:w-32 sm:h-32 text-cyan-600" strokeWidth={1.5} />
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-lg animate-float">
                <span className="text-2xl">😊</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                <span className="text-xl">💡</span>
              </div>
              <div className="absolute top-1/2 -right-8 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                <span className="text-lg">✨</span>
              </div>
            </div>
          </div>

          {/* Right Features */}
          <div className="space-y-6">
            {/* Analytics Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Understanding Students & Emotions</h3>
              </div>
              
              <div className="space-y-3">
                {analyticsData.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-medium text-slate-900">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Card */}
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold">Chat with Mindy, your AI guide</h3>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-white/90">
                    Hi there! Feeling overwhelmed? I'm here to help.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <Button
                  size="icon"
                  className="rounded-full bg-white text-cyan-600 hover:bg-white/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
