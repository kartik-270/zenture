"use client";

import React, { useState, useEffect } from "react";
import { Users, Activity, BookOpen, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/layout";
import { ProtectedRoute } from "@/components/protected-route";

interface Student {
    id: number;
    username: string;
    stats: {
        mood_checkins: number;
        resources_viewed: number;
    };
}

export default function StudentsPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <Students />
        </ProtectedRoute>
    );
}

const Students: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { toast } = useToast();

    useEffect(() => {
        fetchStudents(currentPage);
    }, [currentPage]);

    const fetchStudents = async (page: number) => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${apiConfig.baseUrl}/admin/students?page=${page}&per_page=12`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStudents(data.students || []);
                setTotalPages(data.pages || 1);
            } else {
                toast({ title: "Failed to fetch students", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast({ title: "Error fetching students", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleMakeModerator = async (targetUsername: string) => {
        if (!window.confirm(`Are you sure you want to make ${targetUsername} a Moderator? They will be removed from this list.`)) return;

        try {
            const token = getAuthToken();
            const res = await fetch(`${apiConfig.baseUrl}/admin/assign_moderator`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ username: targetUsername })
            });
            if (res.ok) {
                toast({ title: `${targetUsername} is now a Moderator!` });
                fetchStudents(currentPage);
            } else {
                const data = await res.json();
                toast({ title: data.msg || "Failed to assign moderator", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error assigning moderator:", error);
            toast({ title: "Error assigning moderator", variant: "destructive" });
        }
    };

    return (
        <AdminLayout
            title="Student Directory"
            icon={<Users className="text-blue-500" />}
        >
            <div className="mb-8 flex justify-between items-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search students by name..." 
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                </div>
                <div className="text-sm font-black uppercase tracking-widest text-slate-400">
                    Total: {students.length} Records
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {students.map((student) => (
                            <div key={student.id} className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-50 group">
                                <div className="p-8 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 text-blue-600 text-3xl font-black group-hover:scale-110 transition-transform">
                                        {student.username.charAt(0).toUpperCase()}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">{student.username}</h3>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">Verified Student</p>

                                    <div className="w-full flex justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Checkins</span>
                                            <span className="text-lg font-black text-blue-600 flex items-center gap-1">
                                                <Activity size={16} /> {student.stats?.mood_checkins || 0}
                                            </span>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200 self-center"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Resources</span>
                                            <span className="text-lg font-black text-purple-600 flex items-center gap-1">
                                                <BookOpen size={16} /> {student.stats?.resources_viewed || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Footer / Action */}
                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                                    <button
                                        onClick={() => handleMakeModerator(student.username)}
                                        className="w-full text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white bg-white border border-blue-100 px-4 py-3 rounded-xl transition-all shadow-sm"
                                    >
                                        Elevate to Moderator
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-12 space-x-6">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <span className="text-sm font-black uppercase tracking-widest text-slate-900">
                                Page {currentPage} <span className="text-slate-400 mx-2">/</span> {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )}

                    {students.length === 0 && (
                        <div className="text-center text-slate-400 mt-20 italic">
                            <Users size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-black uppercase tracking-widest opacity-50">No students found in directory.</p>
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    );
};
