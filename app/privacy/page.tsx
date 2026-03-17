"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function Page() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-20">
                <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Privacy Policy</h1>
                <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-cyan-500 pl-6 py-4 bg-cyan-50/50 rounded-r-2xl">
                        Your privacy is our utmost priority. We do not store facial images or audio data.
                    </p>
                    <div className="mt-8 space-y-6 text-slate-700">
                        <section>
                            <h2 className="text-xl font-bold mb-2">1. Facial Analysis Visualization</h2>
                            <p>Facial features are processed locally on your device or in memory. No snapshots are stored on our servers.</p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold mb-2">2. Data Usage</h2>
                            <p>We use your mood history to provide personalized wellness insights and trend analysis.</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
