"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Flame, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [streak, setStreak] = useState(0);
  const [userRole, setUserRole] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();

    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    // Also listen for custom storage events from same tab
    const handleCustomStorage = () => {
      checkAuthStatus();
    };
    window.addEventListener("storage-changed", handleCustomStorage);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage-changed", handleCustomStorage);
    };
  }, []);

  const checkAuthStatus = () => {
    const token = getAuthToken();
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("userRole");

    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setUserRole(storedRole || "student");
      fetchStreak(token);
    } else {
      setIsLoggedIn(false);
      setUsername("");
      setStreak(0);
      setUserRole("");
    }
  };

  const fetchStreak = (token: string) => {
    fetch(`${apiConfig.baseUrl}/user/streak`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStreak(data.streak || 0))
      .catch(() => setStreak(0));
  };

  const handleLogout = async () => {
    try {
      const token = getAuthToken();
      if (token && token !== "null" && token !== "undefined") {
        await fetch(`${apiConfig.baseUrl}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.clear();
    setIsLoggedIn(false);
    setUsername("");
    setStreak(0);
    setMobileOpen(false);
    setShowDropdown(false);
    router.push("/login");
  };

  const getDashboardUrl = () => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "counselor") return "/counselor";
    return "/dashboard";
  };

  const navLink = (href: string, label: string) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`relative px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "text-cyan-600"
            : "text-slate-700 hover:text-cyan-600"
        }`}
      >
        {label}
        {isActive && (
          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <nav suppressHydrationWarning className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div suppressHydrationWarning className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-700 bg-clip-text text-transparent">
              Zenture
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLink("/", "Home")}
            {navLink("/resources", "Resources")}
            {navLink("/about", "About")}
            {navLink("/faq", "FAQ")}
            {navLink("/community", "Community")}
          </div>

          {/* Desktop Auth */}
          <div suppressHydrationWarning className="hidden md:flex items-center gap-3">
            {mounted && isLoggedIn ? (
              <>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 rounded-full">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600">{streak}</span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700 hidden sm:block">Hi, {username}</span>
                  </button>
                  {showDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-50">
                      {/* <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          Profile
                        </div>
                      </Link> */}
                      <Link
                        href={getDashboardUrl()}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <Settings size={16} />
                          Dashboard
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-slate-600 hover:text-cyan-600">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white rounded-full px-6">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileOpen ? (
                <X className="h-6 w-6 text-slate-700" />
              ) : (
                <Menu className="h-6 w-6 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mounted && mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block text-lg font-medium text-slate-700 hover:text-cyan-600"
            >
              Home
            </Link>
            <Link
              href="/resources"
              onClick={() => setMobileOpen(false)}
              className="block text-lg font-medium text-slate-700 hover:text-cyan-600"
            >
              Resources
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="block text-lg font-medium text-slate-700 hover:text-cyan-600"
            >
              About
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileOpen(false)}
              className="block text-lg font-medium text-slate-700 hover:text-cyan-600"
            >
              FAQ
            </Link>
            <Link
              href="/community"
              onClick={() => setMobileOpen(false)}
              className="block text-lg font-medium text-slate-700 hover:text-cyan-600"
            >
              Community
            </Link>

            <div suppressHydrationWarning className="pt-4 border-t border-slate-100 space-y-3">
              {mounted && isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-full">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-600">{streak} days streak</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-full">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">Hi, {username}</span>
                  </div>
                  {/* <Link href="/profile" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <User size={16} className="mr-2" />
                      Profile
                    </Button>
                  </Link> */}
                  <Link href={getDashboardUrl()} onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings size={16} className="mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
