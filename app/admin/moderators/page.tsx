"use client";

import React, { useState, useEffect } from "react";
import { Users, Activity, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "@/components/admin/layout";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";

interface Student {
    id: number;
    username: string;
    stats: {
        mood_checkins: number;
        resources_viewed: number;
    };
}

export default function Moderators() {
    return (
        <ProtectedRoute requiredRole="admin">
            <ModeratorsContent />
        </ProtectedRoute>
    );
}

function ModeratorsContent() {
    const [username, setUsername] = useState("Admin");
    const [moderators, setModerators] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { toast } = useToast();

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
        fetchModerators(currentPage);
    }, [currentPage]);

    const fetchModerators = async (page: number) => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${apiConfig.baseUrl}/admin/moderators?page=${page}&per_page=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setModerators(data.moderators || []);
                setTotalPages(data.pages || 1);
            } else {
                toast({ title: "Failed to fetch moderators", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error fetching moderators:", error);
            toast({ title: "Error fetching moderators", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeModerator = async (targetUsername: string) => {
        if (!window.confirm(`Are you sure you want to revoke Moderator status from ${targetUsername}? They will be demoted to Student.`)) return;

        try {
            const token = getAuthToken();
            const res = await fetch(`${apiConfig.baseUrl}/admin/revoke_moderator`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ username: targetUsername })
            });
            if (res.ok) {
                toast({ title: `${targetUsername} is no longer a Moderator.` });
                fetchModerators(currentPage);
            } else {
                const data = await res.json();
                toast({ title: data.msg || "Failed to revoke moderator", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error revoking moderator:", error);
            toast({ title: "Error revoking moderator", variant: "destructive" });
        }
    };

    return (
        <AdminLayout
            title="Moderator Directory"
            icon={<Users className="text-blue-500" />}
            username={username}
        >
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {moderators.map((moderator) => (
                            <div key={moderator.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                                <div className="p-6 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600 text-2xl font-bold">
                                        {moderator.username.charAt(0).toUpperCase()}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{moderator.username}</h3>
                                    <p className="text-sm text-gray-500 mb-6">Moderator</p>

                                    <div className="w-full flex justify-between px-4 py-2 bg-gray-50 rounded-lg mb-2">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-500 font-medium uppercase">Mood Checks</span>
                                            <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                                                <Activity size={16} /> {moderator.stats?.mood_checkins || 0}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-500 font-medium uppercase">Resources</span>
                                            <span className="text-lg font-bold text-purple-600 flex items-center gap-1">
                                                <BookOpen size={16} /> {moderator.stats?.resources_viewed || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Daily Activity Summary</span>
                                    <button
                                        onClick={() => handleRevokeModerator(moderator.username)}
                                        className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                                    >
                                        Revoke Moderator
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-8 space-x-4">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-gray-600 font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {moderators.length === 0 && (
                        <div className="text-center text-gray-500 mt-12">
                            <p className="text-xl">No moderators found.</p>
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    );
}
