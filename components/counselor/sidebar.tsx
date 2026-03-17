"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  BookOpen,
  Settings,
  LogOut,
  X
} from "lucide-react";

interface CounsellorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavItem = ({ href, icon: Icon, label, onClose }: { href: string; icon: any; label: string; onClose: () => void }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} onClick={onClose} className={`flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 ${isActive
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-semibold"
          : "hover:bg-slate-800 text-slate-400 hover:text-white"
          }`}>
        <Icon size={22} />
        <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export default function CounsellorSidebar({ isOpen, onClose }: CounsellorSidebarProps) {
  const [username, setUsername] = useState("Counsellor");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored) setUsername(stored);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/counselor" },
    { label: "My Schedule", icon: Calendar, href: "/counselor/schedule" },
    { label: "Clients", icon: Users, href: "/counselor/clients" },
    { label: "Messages", icon: MessageSquare, href: "/counselor/messages" },
    { label: "Resources", icon: BookOpen, href: "/counselor/resources" },
    { label: "Settings", icon: Settings, href: "/counselor/settings" },
  ];

  return (
    <aside className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:static md:translate-x-0
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 font-black text-blue-600">
                Z
              </div>
              <span className="font-bold text-xl tracking-tight">Zenture</span>
          </Link>
          <button onClick={onClose} className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mt-4">
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              href={item.href}
              icon={item.icon}
              label={item.label}
              onClose={onClose}
            />
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-slate-800/50">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{username}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Counsellor Account</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-4 p-3 rounded-xl text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-all duration-200 w-full"
        >
          <LogOut size={20} />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </div>
    </aside>
  );
}
