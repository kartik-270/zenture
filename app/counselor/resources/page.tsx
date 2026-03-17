"use client";

import React, { useState, useEffect } from "react";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import CounsellorLayout from '@/components/counselor/layout';
import { Upload, FileText, Video, Mic, CheckCircle, Clock, Image as ImageIcon, Loader2, BookOpen, Plus, Globe } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";

export default function ResourcesPage() {
    return (
        <ProtectedRoute requiredRole="counselor">
            <Resources />
        </ProtectedRoute>
    );
}

function Resources() {
    const [resources, setResources] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'my-resources' | 'create'>('my-resources');
    const [formData, setFormData] = useState({ title: '', description: '', type: 'article', content: '', url: '', language: 'English' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => { fetchResources(); }, []);

    const fetchResources = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${apiConfig.baseUrl}/counsellor/resources`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setResources(await res.json());
        } catch (e) { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            const token = getAuthToken();
            let finalUrl = formData.url;

            // Handle Cloudinary upload if file is selected
            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', selectedFile);

                const uploadRes = await fetch(`${apiConfig.baseUrl}/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: uploadFormData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    finalUrl = uploadData.url;
                } else {
                    toast({ title: "Upload Failed", description: "Failed to upload media.", variant: "destructive" });
                    setIsUploading(false);
                    return;
                }
            }

            const res = await fetch(`${apiConfig.baseUrl}/counsellor/resources`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, url: finalUrl })
            });

            if (res.ok) {
                toast({ title: "Success", description: "Resource submitted for review." });
                setFormData({ title: '', description: '', type: 'article', content: '', url: '', language: 'English' });
                setSelectedFile(null);
                fetchResources();
                setActiveTab('my-resources');
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to submit resource.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <CounsellorLayout title="Resources" icon={<BookOpen />}>
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Custom Tabs */}
                <div className="flex p-2 bg-slate-100/50 backdrop-blur-md rounded-[2rem] w-fit mx-auto lg:mx-0 shadow-inner border border-slate-100">
                    <button
                        onClick={() => setActiveTab('my-resources')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${activeTab === 'my-resources'
                            ? 'bg-white text-blue-600 shadow-xl shadow-slate-200/50'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <BookOpen size={14} /> My Contributions
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${activeTab === 'create'
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-200/50'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <Plus size={14} /> Create New
                    </button>
                </div>

                {activeTab === 'my-resources' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {resources.map(r => (
                            <div key={r.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 overflow-hidden flex flex-col">
                                <div className="relative h-48 bg-slate-50 flex items-center justify-center overflow-hidden">
                                    {r.type === 'video' ? <Video size={48} className="text-slate-100 group-hover:scale-110 transition-transform duration-700" /> :
                                        r.type === 'audio' ? <Mic size={48} className="text-slate-100 group-hover:scale-110 transition-transform duration-700" /> :
                                            <FileText size={48} className="text-slate-100 group-hover:scale-110 transition-transform duration-700" />}
                                    <div className={`absolute top-6 right-6 px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${r.status === 'approved'
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                        }`}>
                                        {r.status === 'approved' ? 'Live' : 'Pending Review'}
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                                            {r.type}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                            {r.language}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                        {r.title}
                                    </h3>
                                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Clock size={10} className="text-slate-400" />
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(r.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {resources.length === 0 && (
                            <div className="col-span-full py-32 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                                <BookOpen size={64} className="mb-6" />
                                <h3 className="text-lg font-black uppercase tracking-widest">Empty Portfolio</h3>
                                <p className="text-[10px] font-medium mt-2 max-w-xs uppercase tracking-widest">Share your expertise with the community by creating your first resource.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto bg-white p-10 lg:p-16 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-10 leading-none">Global Knowledge Share</h2>
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Choose Format</label>
                                <div className="flex flex-wrap gap-4">
                                    {['article', 'video', 'audio'].map(t => (
                                        <label key={t} className={`flex-1 min-w-[120px] relative group cursor-pointer`}>
                                            <input
                                                type="radio"
                                                name="type"
                                                value={t}
                                                checked={formData.type === t}
                                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                className="absolute inset-0 opacity-0 peer"
                                            />
                                            <div className="p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] flex flex-col items-center gap-3 transition-all duration-300 peer-checked:bg-white peer-checked:border-blue-600 peer-checked:shadow-2xl peer-checked:shadow-blue-100">
                                                {t === 'article' && <FileText className="text-slate-400 peer-checked:text-blue-600" />}
                                                {t === 'video' && <Video className="text-slate-400 peer-checked:text-blue-600" />}
                                                {t === 'audio' && <Mic className="text-slate-400 peer-checked:text-blue-600" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{t}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Resource Title</label>
                                        <input
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500 shadow-inner"
                                            placeholder="Coping Strategies..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Language Focus</label>
                                        <div className="relative">
                                            <select
                                                value={formData.language}
                                                onChange={e => setFormData({ ...formData, language: e.target.value })}
                                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500 shadow-inner appearance-none cursor-pointer"
                                            >
                                                {['English', 'Hindi', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'].map(l => (
                                                    <option key={l} value={l}>{l}</option>
                                                ))}
                                            </select>
                                            <Globe className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Narrative Description</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500 shadow-inner h-[142px] resize-none"
                                        placeholder="What will students learn from this..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-10 pt-10 border-t border-slate-50">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                                        {formData.type === 'article' ? 'Article Backdrop' : 'Master Media File'}
                                    </label>
                                    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors group relative">
                                        <input
                                            type="file"
                                            accept={formData.type === 'video' ? 'video/*' : formData.type === 'audio' ? 'audio/*' : 'image/*'}
                                            onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center gap-4 text-center">
                                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-300">
                                                <Upload className="text-blue-600" size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 leading-none mb-2">
                                                    {selectedFile ? 'File Stage Loaded' : 'Click to Upload Source'}
                                                </h4>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                                    {selectedFile ? selectedFile.name : `Max Size 50MB (Supports ${formData.type === 'video' ? 'MP4/MOV' : formData.type === 'audio' ? 'MP3/WAV' : 'JPG/PNG'})`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {formData.type === 'article' && (
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Body Content (Markdown)</label>
                                        <textarea
                                            required
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-3xl p-8 text-sm outline-none focus:ring-2 ring-blue-500 min-h-[400px] shadow-inner font-mono leading-relaxed"
                                            placeholder="# Your Story Starts Here..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center lg:justify-end pt-10">
                                <button
                                    type="submit"
                                    disabled={isUploading || !formData.title}
                                    className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl shadow-slate-300 disabled:opacity-50 disabled:shadow-none flex items-center gap-4"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Syncing Knowledge...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} />
                                            Publish Resource
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </CounsellorLayout>
    );
}
