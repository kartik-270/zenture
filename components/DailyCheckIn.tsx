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
    analysis?: string;
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
        checkStatus();
        localStorage.setItem('last_mood_checkin', new Date().toDateString());
    };

    const handleQuickLog = async (mood: string) => {
        setIsUpdating(true);
        try {
            const token = getAuthToken();
            if (!token) {
                console.error("No auth token available for quick log");
                setIsUpdating(false);
                return;
            }
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
                localStorage.setItem('last_mood_checkin', new Date().toDateString());
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
            <div className="w-full h-[280px] bg-slate-50 rounded-2xl animate-pulse flex items-center justify-center border border-slate-100">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs text-slate-400 font-medium">Loading wellness space...</p>
                </div>
            </div>
        );
    }

    return (
        <section className="w-full">
            <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-50 shadow-sm group">
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 transition-opacity group-hover:opacity-70" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-cyan-50 rounded-full blur-3xl opacity-50 transition-opacity group-hover:opacity-70" />

                <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 text-blue-600 font-bold text-[10px] uppercase tracking-wider">
                            <Sparkles size={12} className="animate-pulse" />
                            {hasCheckedInToday ? "Daily Journey" : "Self-Care Daily"}
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                            {hasCheckedInToday ? "Is there any mood change?" : "How's your mood today?"}
                        </h2>
                        <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
                            {hasCheckedInToday
                                ? (latestMood?.analysis 
                                    ? `"${latestMood.analysis}"`
                                    : `You've logged ${checkinCount} ${checkinCount === 1 ? 'mood' : 'moods'} today. Each data point helps refine your wellness journey.`)
                                : "Take 30 seconds to log your feelings and get a personalized wellness analysis."
                            }
                        </p>

                        {hasCheckedInToday && latestMood && (
                            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 justify-center md:justify-start">
                                <span className="flex items-center gap-1.5"><BarChart3 size={14} className="text-blue-500" /> TRACKED</span>
                                <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> LAST: {new Date(latestMood.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        )}

                        {allCheckins.length > 0 && (
                            <div className="pt-4 border-t border-slate-50">
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                    {allCheckins.map((c, i) => {
                                        const moodEmojis: Record<string, string> = {
                                            'Happy': '😊', 'Calm': '😌', 'Stressed': '😟',
                                            'Sad': '😥', 'Anxious': '😰', 'Angry': '😠'
                                        };
                                        return (
                                            <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                                                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-lg border border-slate-100">
                                                    {moodEmojis[c.mood] || '😐'}
                                                </div>
                                                <span className="text-[8px] font-bold text-slate-400">
                                                    {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        {!isLoggedIn ? (
                            <div className="flex flex-col items-center gap-3">
                                <Button
                                    onClick={() => window.location.href = "/login"}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-6 font-bold shadow-lg shadow-blue-100"
                                >
                                    Login to Check-in
                                </Button>
                            </div>
                        ) : !hasCheckedInToday ? (
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl px-10 py-8 text-lg font-bold shadow-xl shadow-blue-100 transition-all hover:scale-105 active:scale-95"
                            >
                                Start Check-in
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-blue-700 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                                    {isUpdating ? "Capturing..." : "Quick Capture"}
                                    {isUpdating && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />}
                                </p>
                                <div className="flex items-center gap-2 justify-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                                    {[
                                        { l: "Happy", e: "😊" },
                                        { l: "Calm", e: "😌" },
                                        { l: "Stressed", e: "😟" },
                                        { l: "Sad", e: "😥" },
                                        { l: "Anxious", e: "😰" }
                                    ].map((m) => (
                                        <button
                                            key={m.l}
                                            onClick={() => handleQuickLog(m.l)}
                                            disabled={isUpdating}
                                            className="w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-all hover:scale-110 active:scale-95 hover:bg-white hover:shadow-sm"
                                            title={m.l}
                                        >
                                            {m.e}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full text-blue-600 hover:bg-blue-50 font-bold border border-dashed border-blue-200 rounded-xl py-6 transition-all"
                                >
                                    + Detailed Log
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <MoodCheckinModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                isSimplified={hasCheckedInToday}
            />
        </section>
    );
}
