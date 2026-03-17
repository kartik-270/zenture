"use client";

import React, { useState, useEffect } from "react";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import CounsellorLayout from '@/components/counselor/layout';
import { Save, User, Shield, Clock, MapPin, Briefcase } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";

export default function SettingsPage() {
    return (
        <ProtectedRoute requiredRole="counselor">
            <Settings />
        </ProtectedRoute>
    );
}

function Settings() {
    const [profile, setProfile] = useState<any>({
        username: '',
        specialization: '',
        availability: { days: [], timeRange: '09:00-17:00' },
        meeting_location: ''
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = getAuthToken();
                const res = await fetch(`${apiConfig.baseUrl}/counsellor/settings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const availability = data.availability && typeof data.availability === 'object'
                        ? {
                            days: data.availability.days || ["Mon", "Tue", "Wed", "Thu", "Fri"],
                            timeRange: data.availability.timeRange || "09:00-18:00"
                        }
                        : { days: ["Mon", "Tue", "Wed", "Thu", "Fri"], timeRange: "09:00-18:00" };

                    setProfile({ ...data, availability });
                }
            } catch (e) {
                console.error("Failed to fetch settings", e);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleDayToggle = (day: string) => {
        setProfile((prev: any) => {
            const days = prev.availability.days.includes(day)
                ? prev.availability.days.filter((d: string) => d !== day)
                : [...prev.availability.days, day];
            return {
                ...prev,
                availability: { ...prev.availability, days }
            };
        });
    };

    const handleTimeChange = (type: 'start' | 'end', value: string) => {
        setProfile((prev: any) => {
            const range = prev.availability?.timeRange || "09:00-17:00";
            const [start, end] = range.split("-");
            const newRange = type === 'start' ? `${value}-${end}` : `${start}-${value}`;
            return {
                ...prev,
                availability: { ...prev.availability, timeRange: newRange }
            };
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${apiConfig.baseUrl}/counsellor/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    specialization: profile.specialization,
                    availability: profile.availability,
                    meeting_location: profile.meeting_location
                })
            });
            if (res.ok) {
                toast({ title: "Settings Saved", description: "Profile updated successfully." });
            } else {
                toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Update failed.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const [startTime, endTime] = (profile.availability?.timeRange || "09:00-18:00").split("-");

    return (
        <CounsellorLayout title="Settings" icon={<Shield />}>
            <div className="max-w-4xl mx-auto space-y-10 pb-20">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 grayscale opacity-30 text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-2xl animate-spin mb-4"></div>
                        <p className="text-sm font-black uppercase tracking-widest">Loading Config...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-10">
                        {/* Core Profile Card */}
                        <div className="bg-white p-10 lg:p-14 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-700"></div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-10 flex items-center gap-4 relative z-10">
                                <User className="text-blue-600" size={32} />
                                Professional Identity
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">System Username</label>
                                    <input
                                        disabled
                                        value={profile.username}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-black text-slate-400 uppercase tracking-widest shadow-inner cursor-not-allowed"
                                    />
                                    <p className="text-[9px] font-bold text-slate-400 mt-2 italic px-2">Read-only account identifier</p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Core Specialization</label>
                                    <div className="relative">
                                        <input
                                            value={profile.specialization || ''}
                                            onChange={e => setProfile({ ...profile, specialization: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500 shadow-inner"
                                            placeholder="e.g. Clinical Therapy, CBT..."
                                        />
                                        <Briefcase className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="bg-white p-10 lg:p-14 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-10 flex items-center gap-4">
                                <MapPin className="text-blue-600" size={32} />
                                Office Location
                            </h2>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">In-Person Consultation Address</label>
                                <textarea
                                    value={profile.meeting_location || ''}
                                    onChange={e => setProfile({ ...profile, meeting_location: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-3xl p-8 text-sm font-medium outline-none focus:ring-2 ring-blue-500 shadow-inner h-32 resize-none"
                                    placeholder="Enter complete office address..."
                                />
                                <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest leading-relaxed px-2">
                                    <span className="text-blue-600 font-black">Warning:</span> Shared automatically with students upon confirmed physical booking.
                                </p>
                            </div>
                        </div>

                        {/* Availability Grid */}
                        <div className="bg-gradient-to-r from-blue-400 to-cyan-200 p-10 lg:p-14 rounded-[3rem] text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
                            <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-white rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-700"></div>

                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 flex items-center gap-4 relative z-10">
                                <Clock className="text-white" size={32} />
                                Operation Windows
                            </h2>

                            <div className="space-y-10 relative z-10">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 mb-6">Active Service Days</label>
                                    <div className="flex flex-wrap gap-3">
                                        {DAYS_OF_WEEK.map(day => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => handleDayToggle(day)}
                                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${profile.availability.days.includes(day)
                                                    ? "bg-white text-slate-900 border-white shadow-xl shadow-white/10 scale-105"
                                                    : "bg-transparent text-slate-500 border-slate-800 hover:border-slate-600"
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">Shift Commencement</label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => handleTimeChange('start', e.target.value)}
                                            className="w-full bg-white text-slate-900 border-none rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 ring-blue-500 shadow-xl"
                                        />
                                    </div>
                                    <div className="space-y-4 ">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">Shift Conclusion</label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => handleTimeChange('end', e.target.value)}
                                            className="w-full bg-white text-slate-900 border-none rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 ring-blue-500 shadow-xl"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-white rounded-3xl border border-white/10 backdrop-blur-sm">
                                    <p className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest leading-relaxed">
                                        The system dynamically partitions your selected time window into 15-minute professional consultation slots.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex justify-center lg:justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-slate-900 text-white px-16 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 flex items-center gap-4 group"
                            >
                                {isSaving ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <Save className="group-hover:rotate-12 transition-transform" size={20} />
                                )}
                                Synchronize Profile
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </CounsellorLayout>
    );
}
