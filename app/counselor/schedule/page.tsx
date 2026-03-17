"use client";

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import CounsellorLayout from '@/components/counselor/layout';
import { Loader2, Video, Phone, MessageSquare, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { ProtectedRoute } from "@/components/protected-route";

interface Appointment {
    id: number;
    studentName: string;
    date: string;
    time: string;
    mode: string;
    status: string;
}

const customCalendarStyles = `
.react-calendar {
  border: none !important;
  font-family: inherit;
  width: 100% !important;
  background: transparent !important;
  padding: 0 !important;
}
.react-calendar__navigation {
  margin-bottom: 2rem !important;
}
.react-calendar__navigation button {
  min-width: 44px;
  background: none;
  font-size: 16px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #111827;
}
.react-calendar__month-view__weekdays {
  text-align: center;
  text-transform: uppercase;
  font-weight: 800;
  font-size: 10px;
  letter-spacing: 1px;
  color: #9ca3af;
  margin-bottom: 1rem;
}
.react-calendar__tile {
  height: 60px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 1rem !important;
  font-weight: 700 !important;
  color: #4b5563 !important;
  transition: all 0.2s !important;
}
.react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus {
  background-color: #f3f4f6 !important;
  color: #111827 !important;
}
.react-calendar__tile--now {
  background: #eff6ff !important;
  color: #2563eb !important;
}
.react-calendar__tile--active {
  background: #2563eb !important;
  color: white !important;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4) !important;
}
.dot {
  height: 4px;
  width: 4px;
  background-color: currentColor;
  border-radius: 50%;
  margin-top: 4px;
}
`;

export default function SchedulePage() {
    return (
        <ProtectedRoute requiredRole="counselor">
            <Schedule />
        </ProtectedRoute>
    );
}

function Schedule() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            const token = getAuthToken();
            try {
                const res = await fetch(`${apiConfig.baseUrl}/counsellor/dashboard-data`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                const apps = (data.appointments || []).map((a: any) => {
                    const dateStrRaw = a.date || a.appointment_time || a.time;
                    const studentName = a.studentName || a.student_name || `Student #${a.student_id || '?'}`;
                    const dateObj = new Date(dateStrRaw);
                    const dateStr = dateObj.toLocaleDateString('en-CA');
                    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return {
                        id: a.id,
                        studentName: studentName,
                        date: dateStr,
                        time: timeStr,
                        mode: a.mode,
                        status: a.status
                    };
                });
                setAppointments(apps);
            } catch (err) {
                console.error("Failed to fetch schedule", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    const getDayAppointments = (date: Date) => {
        const selectedDateStr = date.toLocaleDateString('en-CA');
        return appointments.filter(a => a.date === selectedDateStr);
    };

    const getTileContent = ({ date, view }: any) => {
        if (view === 'month') {
            const apps = getDayAppointments(date);
            if (apps.length > 0) {
                return <div className="dot"></div>;
            }
        }
        return null;
    };

    const selectedAppointments = getDayAppointments(selectedDate);

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'video_call': return <Video size={14} />;
            case 'voice_call': return <Phone size={14} />;
            case 'in_person': return <MapPin size={14} />;
            default: return <MessageSquare size={14} />;
        }
    };

    return (
        <CounsellorLayout title="Schedule" icon={<CalendarIcon />}>
            <style>{customCalendarStyles}</style>
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 h-full">
                {/* Calendar Column */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <Calendar
                            onChange={(val) => {
                                if (val instanceof Date) {
                                    setSelectedDate(val);
                                } else if (Array.isArray(val) && val[0] instanceof Date) {
                                    setSelectedDate(val[0]);
                                }
                            }}
                            value={selectedDate}
                            tileContent={getTileContent}
                        />
                    </div>

                    <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 leading-none">Quick Note</h3>
                        <p className="text-blue-100 text-xs font-black uppercase tracking-widest opacity-80">
                            Current session slot: 45 Mins
                        </p>
                    </div>
                </div>

                {/* List Column */}
                <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Agenda for</p>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900">
                                {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h2>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                                {selectedAppointments.length} Sessions
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
                            </div>
                        ) : selectedAppointments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center py-20 grayscale opacity-30 text-center">
                                <CalendarIcon size={64} className="mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest">No activities scheduled.</p>
                                <p className="text-[10px] font-medium mt-2 max-w-[200px]">You are free to relax or catch up on documentation.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedAppointments.map(app => (
                                    <div key={app.id} className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl hover:border-blue-200 hover:bg-white transition-all duration-300 group flex items-center gap-6">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow">
                                            <p className="text-xs font-black uppercase tracking-tighter text-gray-900">{app.time.split(' ')[0]}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{app.time.split(' ')[1] || ""}</p>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-black uppercase tracking-tighter text-gray-900 leading-none mb-2">{app.studentName}</h3>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-lg border border-gray-100">
                                                            <span className="text-blue-600">{getModeIcon(app.mode)}</span>
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{app.mode.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${app.status === 'booked' || app.status === 'confirmed'
                                                    ? 'bg-green-50 text-green-600 border-green-100'
                                                    : 'bg-white text-gray-400 border-gray-100'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CounsellorLayout>
    );
}
