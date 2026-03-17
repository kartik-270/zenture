"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    Users,
    AlertTriangle,
    Stethoscope,
    BookOpen,
    BarChart2,
    Settings,
    LogOut,
    Menu,
    X,
    MessageCircle,
    Shield
} from "lucide-react";
import { logout } from "@/lib/auth";

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    icon?: React.ReactNode;
    username?: string;
    actions?: React.ReactNode;
}

const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={`flex items-center space-x-4 p-2 rounded-lg transition-colors ${isActive ? "bg-slate-800 text-blue-400 font-semibold" : "hover:bg-slate-800 text-slate-100"}`}>
            <Icon size={22} />
            <span>{label}</span>
        </Link>
    );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, icon, username = "Admin", actions }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="flex h-screen bg-slate-100 relative">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 flex justify-between items-center z-50 shadow-md">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="font-bold text-lg">Zenture Admin</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                    {username?.charAt(0).toUpperCase()}
                </div>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
                <nav className="space-y-6 mt-12 md:mt-0">
                    <Link href="/admin/dashboard">
                        <h1 className="text-2xl font-bold text-white mb-8 hidden md:block">Zenture Admin</h1>
                    </Link>

                    <NavItem href="/admin/dashboard" icon={Home} label="Dashboard Home" />
                    <NavItem href="/admin/students" icon={Users} label="Student Directory" />
                    <NavItem href="/admin/moderators" icon={Shield} label="Moderator Directory" />
                    <NavItem href="/admin/communities" icon={MessageCircle} label="Community Forums" />
                    <NavItem href="/admin/crisis-escalation" icon={AlertTriangle} label="Crisis & Escalation" />
                    <NavItem href="/admin/counselor-availability" icon={Stethoscope} label="Counselor Availability" />
                    <NavItem href="/admin/resources" icon={BookOpen} label="Resource Management" />
                    <NavItem href="/admin/reports" icon={BarChart2} label="Reporting & Analytics" />
                    <NavItem href="/admin/settings" icon={Settings} label="Settings" />
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-4 p-2 rounded-lg text-red-400 hover:bg-slate-800 transition-colors w-full mb-8 md:mb-0"
                >
                    <LogOut size={22} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0 h-full w-full">
                <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
                    {/* Desktop Header */}
                    <header className="hidden md:flex justify-between items-center pb-4 border-b border-slate-300">
                        <Link href="/admin/dashboard" className="hover:opacity-80 transition-opacity cursor-pointer">
                            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                                {icon}
                                {title}
                            </h1>
                        </Link>
                        <div className="flex items-center space-x-3">
                            <span className="text-lg text-slate-600">
                                Welcome, <span className="font-semibold text-slate-900">{username}</span>!
                            </span>
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {username?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </header>

                    {/* Mobile Page Title (below header) */}
                    <div className="md:hidden flex flex-col gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            {icon}
                            {title}
                        </h2>
                    </div>

                    {/* Action Button Area (e.g. Add Button) */}
                    {actions && (
                        <div className="mb-4">
                            {actions}
                        </div>
                    )}

                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
