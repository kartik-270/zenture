"use client";
import React, { useState, useEffect } from "react";
import {
    Menu,
    X,
} from "lucide-react";
import CounsellorSidebar from "./sidebar";

interface CounsellorLayoutProps {
    children: React.ReactNode;
    title: string;
    icon?: React.ReactNode;
}

const CounsellorLayout: React.FC<CounsellorLayoutProps> = ({ children, title, icon }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [username, setUsername] = useState("Counsellor");

    useEffect(() => {
        const stored = localStorage.getItem("username");
        if (stored) setUsername(stored);
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 relative">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 flex justify-between items-center z-50 shadow-md">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="font-bold text-lg tracking-tight">Zenture</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-sm font-bold shadow-lg">
                    {username.charAt(0).toUpperCase()}
                </div>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <CounsellorSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0 h-full w-full">
                <div className="p-4 md:p-10 space-y-6 md:space-y-10 max-w-7xl mx-auto">
                    {/* Desktop Header */}
                    <header className="hidden md:flex justify-between items-end pb-8 border-b border-slate-200">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                                {icon && <span className="text-blue-600">{icon}</span>}
                                {title}
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium italic">Manage your practice and support students.</p>
                        </div>
                        <div className="flex items-center space-x-4 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200 uppercase">
                                {username.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Counsellor</span>
                                <span className="text-lg font-black text-slate-900 leading-none uppercase tracking-tight">{username}</span>
                            </div>
                        </div>
                    </header>

                    {/* Mobile Page Title (below header) */}
                    <div className="md:hidden flex flex-col gap-1 mb-6">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                            {icon && <span className="text-blue-600">{icon}</span>}
                            {title}
                        </h2>
                        <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
};

export default CounsellorLayout;
