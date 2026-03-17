"use client";

import Link from "next/link";
import { BookOpen, Calendar, Heart, ListChecks, ArrowRight } from "lucide-react";

const quickLinks = [
  {
    title: "Psychoeducational Hub",
    description: "Explore articles, videos & audio for a healthier mind",
    href: "/resources",
    icon: BookOpen,
    gradient: "from-cyan-400 to-cyan-600",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    title: "Book a Session",
    description: "Connect with a campus counselor",
    href: "/appointments",
    icon: Calendar,
    gradient: "from-emerald-400 to-emerald-600",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Peer Support",
    description: "Share & connect with fellow students",
    href: "/community",
    icon: Heart,
    gradient: "from-rose-400 to-rose-600",
    bgColor: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    title: "Self-Assessment Tests",
    description: "Take a quick mental health screening test",
    href: "/self-assessment",
    icon: ListChecks,
    gradient: "from-amber-400 to-amber-600",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

export function QuickLinks() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Quick Links
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Access all the tools you need for your mental wellness journey
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                href={link.href}
                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-transparent transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient border on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm`} />
                <div className="absolute inset-[1px] rounded-2xl bg-white -z-10" />
                
                <div className="flex flex-col gap-4">
                  <div className={`w-14 h-14 rounded-xl ${link.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${link.iconColor}`} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-cyan-700 transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-sm font-medium text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
