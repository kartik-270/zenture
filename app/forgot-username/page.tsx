"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Page() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="max-w-md mx-auto px-4 py-20 text-center">
                <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Forgot Username?</h1>
                <p className="text-slate-500 mb-8">Enter your registered email address to retrieve your username.</p>
                
                <div className="space-y-4">
                    <div className="text-left">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Email Address</label>
                        <Input type="email" placeholder="email@example.com" className="rounded-xl h-12" />
                    </div>
                    <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-xs">
                        Retrieve Username
                    </Button>
                    <div className="mt-6">
                        <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
