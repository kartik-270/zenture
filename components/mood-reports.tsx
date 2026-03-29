"use client";

import { useState, useEffect, useMemo } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    AreaChart, Area
} from 'recharts';
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import {
    Calendar, TrendingUp, History, Info,
    CheckCircle2, CloudRain, Sun, Cloud, Loader2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface MoodEntry {
    mood: string;
    intensity: number;
    sleep: string;
    social: boolean;
    energy: string;
    wellness_score: number;
    analysis: string;
    date: string;
}

export function MoodReports() {
    const [history, setHistory] = useState<MoodEntry[]>([]);
    const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const daysMap = { daily: 1, weekly: 7, monthly: 30 };
            const token = getAuthToken();
            const response = await fetch(`${apiConfig.baseUrl}/mood-history?days=${daysMap[view]}`, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` })
                },
            });
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Fetch history error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [view]);

    // Listen for updates to re-fetch
    useEffect(() => {
        const handleUpdate = () => fetchHistory();
        window.addEventListener('streak-updated', handleUpdate);
        return () => window.removeEventListener('streak-updated', handleUpdate);
    }, [view]);

    const chartData = useMemo(() => {
        return history.map(entry => {
            const date = new Date(entry.date);
            let label = "";
            if (view === 'daily') {
                label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
            return {
                label,
                intensity: entry.intensity,
                wellness: entry.wellness_score || entry.intensity, // Fallback for old records
                mood: entry.mood,
                rawDate: date
            };
        });
    }, [history, view]);

    const averageWellness = useMemo(() => {
        if (history.length === 0) return 0;
        const sum = history.reduce((acc, curr) => acc + (curr.wellness_score || curr.intensity), 0);
        return (sum / history.length).toFixed(1);
    }, [history]);

    const getMoodIcon = (mood: string) => {
        const m = mood.toLowerCase();
        if (m === 'happy' || m === 'calm') return <Sun className="text-yellow-500" />;
        if (m === 'sad' || m === 'anxious' || m === 'stressed') return <CloudRain className="text-blue-500" />;
        return <Cloud className="text-slate-400" />;
    };

    return (
        <section className="w-full space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your Wellness Insights</h2>
                    <p className="text-sm text-slate-500">Visualization of your emotional journey.</p>
                </div>

                <div className="flex p-1 bg-slate-100 rounded-xl self-start">
                    {(['daily', 'weekly', 'monthly'] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${view === v ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Card */}
                <Card className="lg:col-span-2 border-slate-100 shadow-sm overflow-hidden rounded-3xl">
                    <CardHeader className="bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="text-blue-600 w-5 h-5" />
                                Wellness Score Trend
                            </CardTitle>
                            <div className="text-xs font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-widest">
                                Avg Index: {averageWellness}/10
                            </div>
                        </div>
                        <CardDescription className="text-xs">Tracing your emotion strength over the {view} period.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 h-[300px]">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                <Loader2 className="animate-spin mr-2" /> Loading data...
                            </div>
                        ) : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={[0, 10]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        itemStyle={{ fontWeight: 'bold', color: '#3b82f6' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="wellness"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorIntensity)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                <Calendar size={48} className="opacity-10" />
                                <p className="text-xs font-bold uppercase tracking-widest opacity-40">No check-ins recorded.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Insights */}
                <Card className="border-slate-100 shadow-sm rounded-3xl h-full overflow-hidden">
                    <CardHeader className="bg-slate-50/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <History className="text-blue-600 w-5 h-5" />
                            Recent Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {history.length > 0 ? (
                                [...history].reverse().slice(0, 5).map((entry, i) => (
                                    <div key={i} className="group p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <div className="flex items-center gap-1.5">
                                                {getMoodIcon(entry.mood)}
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">{entry.mood}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                {new Date(entry.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed italic">
                                            "{entry.analysis}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No data available yet</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Logs", value: history.length, icon: <CheckCircle2 className="text-green-500 w-4 h-4" />, bg: "bg-green-50" },
                    { label: "Deep Sleep", value: history[0]?.sleep || "N/A", icon: <History className="text-indigo-500 w-4 h-4" />, bg: "bg-indigo-50" },
                    { label: "Socialized", value: history.filter(h => h.social).length + " Days", icon: <Info className="text-orange-500 w-4 h-4" />, bg: "bg-orange-50" },
                    { label: "Global Mood", value: `${averageWellness}/10`, icon: <TrendingUp className="text-blue-500 w-4 h-4" />, bg: "bg-blue-50" },
                ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-3xl border border-white shadow-sm flex flex-col gap-2 ${stat.bg}`}>
                        <div className="bg-white/80 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-lg font-black text-slate-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
