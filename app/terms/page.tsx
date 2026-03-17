"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function Page() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-20">
                <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Terms of Service</h1>
                <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-blue-500 pl-6 py-4 bg-blue-50/50 rounded-r-2xl">
                        Our terms of service provide a safe and professional environment for student wellness.
                    </p>
                    <div className="mt-8 space-y-6 text-slate-700">
                        <section>
                            <h2 className="text-xl font-bold mb-2">1. Privacy and Confidentiality</h2>
                            <p>Your data and conversations are confidential, protected by state-of-the-art encryption.</p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold mb-2">2. User Conduct</h2>
                            <p>Users are expected to maintain respectful behavior within the community and sessions.</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
