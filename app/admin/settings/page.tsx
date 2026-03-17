"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Users,
  Shield,
  CreditCard,
  RefreshCcw,
  Puzzle,
  X,
  Lock
} from "lucide-react";
import AdminLayout from "@/components/admin/layout";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";

export default function SettingsPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <SettingsContent />
        </ProtectedRoute>
    );
}

function SettingsContent() {
  const [username, setUsername] = useState("Admin");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} is not yet available in this version.`,
    });
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    // In a real app, you would make an API call here
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
    setIsPasswordModalOpen(false);
  };

  return (
    <AdminLayout
      title="System Settings"
      icon={<Settings className="text-blue-500" />}
      username={username}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          onClick={() => handleComingSoon("General Settings")}
          className="cursor-pointer bg-white rounded-xl p-6 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-blue-500 transition-all duration-300 flex flex-col items-start border border-gray-100"
        >
          <div className="p-3 bg-blue-50 rounded-lg mb-4">
            <Settings className="text-blue-600" size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-xl">General</h3>
          <p className="text-sm text-gray-500 mt-1">Site preferences, notifications, accessibility</p>
        </div>

        <div
          onClick={() => handleComingSoon("User Management")}
          className="cursor-pointer bg-white rounded-xl p-6 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-blue-500 transition-all duration-300 flex flex-col items-start border border-gray-100"
        >
          <div className="p-3 bg-indigo-50 rounded-lg mb-4">
            <Users className="text-indigo-600" size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-xl">User Management</h3>
          <p className="text-sm text-gray-500 mt-1">Roles, permissions, and passwords</p>
        </div>

        <div
          onClick={() => handleComingSoon("Admin Accounts")}
          className="cursor-pointer bg-white rounded-xl p-6 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-blue-500 transition-all duration-300 flex flex-col items-start border border-gray-100"
        >
          <div className="p-3 bg-green-50 rounded-lg mb-4">
            <Shield className="text-green-600" size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-xl">Admin Accounts</h3>
          <p className="text-sm text-gray-500 mt-1">Audit logs, 2FA, access control</p>
        </div>

        <div
          onClick={() => handleComingSoon("Subscriptions & Billing")}
          className="cursor-pointer bg-white rounded-xl p-6 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-blue-500 transition-all duration-300 flex flex-col items-start border border-gray-100"
        >
          <div className="p-3 bg-yellow-50 rounded-lg mb-4">
            <CreditCard className="text-yellow-600" size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-xl">Subscriptions & Billing</h3>
          <p className="text-sm text-gray-500 mt-1">Billing info and plan management</p>
        </div>

        <div
          onClick={() => handleComingSoon("System Updates")}
          className="cursor-pointer bg-white rounded-xl p-6 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-blue-500 transition-all duration-300 flex flex-col items-start border border-gray-100"
        >
          <div className="p-3 bg-purple-50 rounded-lg mb-4">
            <RefreshCcw className="text-purple-600" size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-xl">System Updates</h3>
          <p className="text-sm text-gray-500 mt-1">Version control, backup & restore</p>
        </div>

        <div
          onClick={() => handleComingSoon("Integrations")}
          className="cursor-pointer bg-white rounded-xl p-6 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-blue-500 transition-all duration-300 flex flex-col items-start border border-gray-100"
        >
          <div className="p-3 bg-pink-50 rounded-lg mb-4">
            <Puzzle className="text-pink-600" size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-xl">Integrations</h3>
          <p className="text-sm text-gray-500 mt-1">Third-party tools and API keys</p>
        </div>

        <div
          onClick={() => setIsPasswordModalOpen(true)}
          className="cursor-pointer bg-white rounded-xl p-6 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-blue-500 transition-all duration-300 flex flex-col items-start border border-gray-100"
        >
          <div className="p-3 bg-red-50 rounded-lg mb-4">
            <Lock className="text-red-600" size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-xl">Security</h3>
          <p className="text-sm text-gray-500 mt-1">Change password and security settings</p>
        </div>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Lock size={20} /> Change Password
              </h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                onClick={handleChangePassword}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-bold"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
