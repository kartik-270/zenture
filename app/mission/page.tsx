"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function Page() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-20">
                <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Our Mission</h1>
                <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-orange-500 pl-6 py-4 bg-orange-50/50 rounded-r-2xl">
                        Empowering students with AI-driven mental health support.
                    </p>
                    <div className="mt-8 space-y-6 text-slate-700">
                        <section>
                            <h2 className="text-xl font-bold mb-2">1. Accessibility</h2>
                            <p>Providing 24/7 mental health resources and AI companionship.</p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold mb-2">2. Professional Care</h2>
                            <p>Bridging the gap between students and certified counselors.</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
