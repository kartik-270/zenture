"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Trash2, MessageCircle } from "lucide-react";
import AdminLayout from "@/components/admin/layout";
import { apiConfig } from "@/lib/config";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";
import { useRouter } from "next/navigation";

interface Community {
    id: number;
    name: string;
    description: string;
    member_count: number;
}

export default function AdminCommunities() {
    return (
        <ProtectedRoute requiredRole="admin">
            <AdminCommunitiesContent />
        </ProtectedRoute>
    );
}

function AdminCommunitiesContent() {
    const [username, setUsername] = useState("Admin");
    const router = useRouter();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCommunityName, setNewCommunityName] = useState("");
    const [newCommunityDesc, setNewCommunityDesc] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
        fetchCommunities();
    }, []);

    const fetchCommunities = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${apiConfig.baseUrl}/communities`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCommunities(data);
            } else {
                toast({ title: "Failed to fetch communities", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error fetching communities:", error);
            toast({ title: "Error fetching communities", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCommunity = async () => {
        if (!newCommunityName) {
            toast({ title: "Name is required", variant: "destructive" });
            return;
        }
        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch(`${apiConfig.baseUrl}/communities`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: newCommunityName, description: newCommunityDesc })
            });

            if (res.ok) {
                toast({ title: "Community created successfully" });
                setIsCreateModalOpen(false);
                setNewCommunityName("");
                setNewCommunityDesc("");
                fetchCommunities();
            } else {
                const data = await res.json();
                toast({ title: data.msg || "Failed to create", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error creating community:", error);
            toast({ title: "Error creating community", variant: "destructive" });
        }
    };

    const handleDeleteCommunity = async (id: number, name: string) => {
        if (!window.confirm(`Are you sure you want to completely delete the community "${name}" and all its posts?`)) return;

        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch(`${apiConfig.baseUrl}/communities/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                toast({ title: "Community deleted" });
                fetchCommunities();
            } else {
                toast({ title: "Failed to delete community", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error deleting community:", error);
            toast({ title: "Error deleting community", variant: "destructive" });
        }
    };

    return (
        <AdminLayout
            title="Community Forums"
            icon={<MessageCircle className="text-blue-500" />}
            username={username}
            actions={
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={20} />
                    Create Community
                </button>
            }
        >
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communities.map((community) => (
                        <div key={community.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-800"># {community.name}</h3>
                                <button
                                    onClick={() => handleDeleteCommunity(community.id, community.name)}
                                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                                    title="Delete Community"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <p className="text-gray-600 mb-6 flex-grow">{community.description || "No description provided."}</p>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <div className="flex items-center text-gray-500 text-sm font-medium">
                                    <Users size={16} className="mr-1" />
                                    {community.member_count} Members
                                </div>
                                <button onClick={() => router.push("/community")} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                                    View Posts &rarr;
                                </button>
                            </div>
                        </div>
                    ))}

                    {communities.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                            <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-xl font-medium text-gray-700">No communities found</p>
                            <p className="mt-2">Create the first community to get the conversation started.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Community Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-2xl font-bold text-gray-800">Create New Community</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">&times;</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Community Name</label>
                                <input
                                    type="text"
                                    value={newCommunityName}
                                    onChange={(e) => setNewCommunityName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                                    placeholder="e.g., General Chat"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                                <textarea
                                    value={newCommunityDesc}
                                    onChange={(e) => setNewCommunityDesc(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow min-h-[100px]"
                                    placeholder="What is this community about?"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateCommunity}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Create Community
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
