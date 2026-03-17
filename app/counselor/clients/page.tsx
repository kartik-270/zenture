"use client";

import React, { useState, useEffect } from "react";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import CounsellorLayout from '@/components/counselor/layout';
import { Search, User, ClipboardList, Save, Users, Calendar } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";

interface ClientBasic {
    id: number;
    name: string;
    email?: string;
    latest_note?: string;
}

interface ClientDetail {
    student: { id: number; name: string; email: string };
    notes: { id: number; content: string; timestamp: string }[];
    appointments: { id: number; date?: string; appointment_time?: string; time?: string; status: string; mode: string }[];
}

export default function ClientsPage() {
    return (
        <ProtectedRoute requiredRole="counselor">
            <Clients />
        </ProtectedRoute>
    );
}

function Clients() {
    const [clients, setClients] = useState<ClientBasic[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [newNote, setNewNote] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${apiConfig.baseUrl}/counsellor/clients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setClients(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectClient = async (id: number) => {
        setLoadingDetails(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${apiConfig.baseUrl}/counsellor/client/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setSelectedClient(await res.json());
            }
        } catch (e) { console.error(e); }
        finally { setLoadingDetails(false); }
    };

    const handeAddNote = async () => {
        if (!selectedClient || !newNote.trim()) return;
        try {
            const token = getAuthToken();
            const res = await fetch(`${apiConfig.baseUrl}/counsellor/client/${selectedClient.student.id}/note`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ note: newNote })
            });

            if (res.ok) {
                toast({ title: "Note Added", description: "Private note saved successfully." });
                setNewNote("");
                handleSelectClient(selectedClient.student.id); // Refresh
            }
        } catch (e) {
            toast({ title: "Error", description: "Could not save note.", variant: "destructive" });
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <CounsellorLayout title="Clients" icon={<Users />}>
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
                {/* Client List */}
                <div className="w-full lg:w-80 bg-white rounded-3xl border border-slate-100 flex flex-col shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold" size={16} />
                            <input
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition-all font-medium"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading...</p>
                            </div>
                        ) : filteredClients.map(c => (
                            <div
                                key={c.id}
                                onClick={() => handleSelectClient(c.id)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 group ${selectedClient?.student.id === c.id
                                    ? 'bg-blue-600 shadow-xl shadow-blue-200 translate-x-1'
                                    : 'hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`font-black text-sm uppercase tracking-tight ${selectedClient?.student.id === c.id ? 'text-white' : 'text-slate-900'}`}>
                                    {c.name}
                                </div>
                                {c.latest_note && (
                                    <div className={`text-[10px] truncate mt-1 font-medium italic ${selectedClient?.student.id === c.id ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-500'}`}>
                                        "{c.latest_note}"
                                    </div>
                                )}
                            </div>
                        ))}
                        {!loading && filteredClients.length === 0 && (
                            <p className="text-center text-slate-400 text-xs py-10 font-medium">No students found.</p>
                        )}
                    </div>
                </div>

                {/* Client Details */}
                <div className="flex-1 overflow-y-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-10 custom-scrollbar">
                    {loadingDetails ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-2xl animate-spin"></div>
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving Student Data...</p>
                        </div>
                    ) : selectedClient ? (
                        <div className="max-w-4xl mx-auto space-y-10">
                            {/* Profile Header */}
                            <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-slate-50">
                                <div className="w-32 h-32 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-600 font-black text-5xl shadow-inner border-2 border-white">
                                    {selectedClient.student.name[0]}
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                                        Student Profile
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">{selectedClient.student.name}</h2>
                                    {/* <p className="text-slate-400 font-black text-sm tracking-widest flex items-center justify-center md:justify-start gap-2 uppercase">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        {selectedClient.student.email}
                                    </p> */}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Private Notes Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-slate-900">
                                        <ClipboardList className="text-blue-600" size={20} /> Private Notes
                                    </h3>

                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                                        <textarea
                                            value={newNote}
                                            onChange={e => setNewNote(e.target.value)}
                                            className="w-full bg-white border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-blue-500 min-h-[120px] shadow-sm font-medium placeholder:text-slate-300 transition-all font-mono"
                                            placeholder="Add confidential clinical observations..."
                                        />
                                        <button
                                            onClick={handeAddNote}
                                            className="mt-4 w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200"
                                        >
                                            <Save size={18} /> Save Session Note
                                        </button>
                                    </div>

                                    <div className="space-y-4 max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedClient.notes.map(n => (
                                            <div key={n.id} className="bg-gradient-to-br from-yellow-50 to-white p-5 rounded-2xl border border-yellow-100 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-100/30 rounded-full -mr-8 -mt-8"></div>
                                                <p className="text-slate-800 text-sm font-medium relative z-10 leading-relaxed font-mono italic">"{n.content}"</p>
                                                <div className="mt-4 flex justify-end">
                                                    <span className="text-[9px] font-black text-yellow-600/60 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-yellow-200/50">
                                                        {new Date(n.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedClient.notes.length === 0 && (
                                            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No clinical notes recorded.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Past Appointments */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-slate-900">
                                        Recent Sessions History
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedClient.appointments.map(a => (
                                            <div key={a.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 uppercase tracking-tight text-xs">{new Date(a.date || a.appointment_time || a.time || "").toLocaleDateString()}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest capitalize">{a.mode.replace('_', ' ')}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${a.status === 'completed'
                                                    ? 'bg-green-50 text-green-600 border-green-100'
                                                    : 'bg-slate-50 text-slate-400 border-slate-100'
                                                    }`}>
                                                    {a.status}
                                                </span>
                                            </div>
                                        ))}
                                        {selectedClient.appointments.length === 0 && (
                                            <p className="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-widest">No previous sessions.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-200 py-20">
                            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-6">
                                <User size={64} className="opacity-20" />
                            </div>
                            <p className="text-xl font-black text-slate-300 uppercase tracking-widest">Select a student</p>
                            <p className="text-xs text-slate-400 font-medium mt-2">Choose from the list to view profile and notes.</p>
                        </div>
                    )}
                </div>
            </div>
        </CounsellorLayout>
    );
}
