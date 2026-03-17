"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Calendar } from "lucide-react";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";

interface Post {
    id: number;
    title: string;
}

export function ConnectAndShare() {
    const [trendingTopic, setTrendingTopic] = useState<Post | null>(null);

    useEffect(() => {
        const fetchTrendingTopic = async () => {
            try {
                const token = getAuthToken();
                if (!token) return;

                const response = await fetch(`${apiConfig.baseUrl}/forum/posts`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.ok) {
                    const posts: Post[] = await response.json();
                    if (posts.length > 0) {
                        setTrendingTopic(posts[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching forum posts:", error);
            }
        };
        fetchTrendingTopic();
    }, []);

    return (
        <section className="w-full">
            <h2 className="text-xl font-bold text-foreground mb-4">Connect & Share</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/community" className="block group">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-100 transition-colors">
                            <Heart className="text-pink-500 group-hover:scale-110 transition-transform" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">Peer Support Hub</h3>
                        <p className="text-sm text-slate-500 mb-4 leading-relaxed">Connect with fellow students in a safe, moderated space.</p>
                        {trendingTopic && (
                            <div className="text-[11px] font-bold bg-slate-50 text-slate-600 p-2 rounded-lg border border-slate-100">
                                🔥 <span className="uppercase tracking-wider mr-1 opacity-70">Trending:</span> {trendingTopic.title}
                            </div>
                        )}
                    </div>
                </Link>

                <Link href="/appointments" className="block group">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                            <Calendar className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">Book a Session</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">Confidential support is available. Connect with a campus counselor when you're ready.</p>
                        <div className="mt-4 text-xs font-bold text-primary flex items-center gap-1">
                           Schedule Now <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    );
}
