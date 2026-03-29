"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import { MoodCheckinModal } from "./mood-checkin-modal";
import { Sparkles, BarChart3, Clock, Lock, LogIn } from "lucide-react";

interface MoodCheckinData {
    mood: string;
    intensity: number;
    timestamp: string;
}

export function DailyCheckIn() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
    const [checkinCount, setCheckinCount] = useState(0);
    const [latestMood, setLatestMood] = useState<MoodCheckinData | null>(null);
    const [allCheckins, setAllCheckins] = useState<MoodCheckinData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkStatus = async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                setIsLoggedIn(false);
                setIsLoading(false);
                return;
            }
            setIsLoggedIn(true);

            const response = await fetch(`${apiConfig.baseUrl}/mood-checkin/today-status`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("DEBUG: Mood checkin status:", data);
                setHasCheckedInToday(data.hasCheckedIn);
                setCheckinCount(data.count || 0);
                setLatestMood(data.latest || null);
                setAllCheckins(data.allCheckins || []);
            }
        } catch (error) {
            console.error("Error checking mood status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    const handleSuccess = (summary: string) => {
        checkStatus(); // Refresh status after successful check-in
    };

    const handleQuickLog = async (mood: string) => {
        setIsUpdating(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${apiConfig.baseUrl}/mood-checkin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ mood })
            });

            if (response.ok) {
                await checkStatus();
                // Brief delay for feedback
                setTimeout(() => setIsUpdating(false), 1000);
            } else {
                setIsUpdating(false);
            }
        } catch (error) {
            console.error("Quick log error:", error);
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-12">
                <div className="border border-blue-100 shadow-xl bg-gradient-to-r from-blue-400 to-cyan-200 rounded-2xl p-8 md:p-10 min-h-[280px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        <p className="text-white/80 font-medium animate-pulse">Preparing your wellness space...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-7xl bg-gradient-to-r from-blue-400 to-cyan-200 mx-auto px-4 sm:px-6 lg:px-8 w-full my-12">
            <div className="relative group overflow-hidden isolate">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />

                <div className="relative bg-white/80 backdrop-blur-md border border-blue-100 shadow-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 text-blue-600 font-bold text-xs uppercase tracking-wider">
                            <Sparkles size={14} className="animate-pulse" />
                            {hasCheckedInToday ? "Daily Journey" : "Self-Care Daily"}
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                            {hasCheckedInToday ? "Is there any mood change?" : "How's your mood today?"}
                        </h2>
                        <p className="text-lg text-slate-600 max-w-lg">
                            {hasCheckedInToday
                                ? `You've logged ${checkinCount} ${checkinCount === 1 ? 'mood' : 'moods'} today. Each data point helps refine your wellness journey.`
                                : "Take 30 seconds to log your feelings and get a personalized wellness analysis."
                            }
                        </p>

                        {hasCheckedInToday && latestMood && (
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-500 justify-center md:justify-start">
                                <span className="flex items-center gap-1.5"><BarChart3 size={16} className="text-blue-500" /> Improvement tracked</span>
                                <span className="flex items-center gap-1.5"><Clock size={16} className="text-blue-500" /> Last update: {new Date(latestMood.timestamp.endsWith('Z') ? latestMood.timestamp : latestMood.timestamp + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        )}

                        {allCheckins.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-blue-50">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today's Journey</p>
                                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{allCheckins.length} logs</span>
                                </div>
                                <div className="max-h-[180px] overflow-y-auto pr-2 py-2 custom-scrollbar">
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-x-3 gap-y-4 px-1">
                                        {allCheckins.map((c, i) => {
                                            const moodEmojis: Record<string, string> = {
                                                'Happy': '😊', 'Calm': '😌', 'Stressed': '😟',
                                                'Sad': '😥', 'Anxious': '😰', 'Angry': '😠'
                                            };
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-blue-50 hover:scale-110 transition-transform">
                                                        {moodEmojis[c.mood] || '😐'}
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100/80 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                                        {new Date(c.timestamp.endsWith('Z') ? c.timestamp : c.timestamp + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        {!isLoggedIn ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                    <Lock size={14} /> Account Required
                                </div>
                                <p className="text-slate-600 text-sm text-center max-w-xs">
                                    Log in to track your daily mood and get personalised wellness insights.
                                </p>
                                <Button
                                    onClick={() => window.location.href = "/login"}
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-2xl px-8 py-4 font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105"
                                >
                                    <LogIn size={16} /> Login Now
                                </Button>
                            </div>
                        ) : !hasCheckedInToday ? (
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-blue-500 to-cyan-300 text-white rounded-2xl px-10 py-8 text-lg font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105"
                            >
                                Start Check-in
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-blue-700 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                                    {isUpdating ? "Capturing..." : "Quickly capture mood"}
                                    {isUpdating && <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />}
                                </p>
                                <div className="flex items-center gap-2 justify-center bg-blue-50/50 p-2 rounded-2xl border border-blue-100">
                                    {[
                                        { l: "Happy", e: "😊" },
                                        { l: "Calm", e: "😌" },
                                        { l: "Stressed", e: "😟" },
                                        { l: "Sad", e: "😥" },
                                        { l: "Anxious", e: "😰" }
                                    ].map((m) => {
                                        const isSelected = latestMood?.mood === m.l;
                                        return (
                                            <button
                                                key={m.l}
                                                onClick={() => handleQuickLog(m.l)}
                                                disabled={isUpdating}
                                                className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-all hover:scale-110 active:scale-95 ${isSelected ? 'bg-white shadow-md border-2 border-blue-200 scale-110' : 'hover:bg-white/50'}`}
                                                title={m.l}
                                            >
                                                {m.e}
                                            </button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold border-2 border-dashed border-blue-100 rounded-2xl py-6 mt-4 transition-all"
                                >
                                    + Add Detailed Log
                                </Button>
                            </div>
                        )}
                        <p className="text-center text-xs text-slate-400 font-medium italic">
                            Private &amp; Securely stored
                        </p>
                    </div>

                </div >
            </div >

            <MoodCheckinModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                isSimplified={hasCheckedInToday}
            />
        </section >
    );
}
