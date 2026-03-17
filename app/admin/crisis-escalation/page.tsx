"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Phone,
} from "lucide-react";
import AdminLayout from "@/components/admin/layout";
import { ProtectedRoute } from "@/components/protected-route";

export default function CrisisEscalation() {
    return (
        <ProtectedRoute requiredRole="admin">
            <CrisisEscalationContent />
        </ProtectedRoute>
    );
}

function CrisisEscalationContent() {
  const [username, setUsername] = useState("Admin");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <AdminLayout
      title="Crisis & Escalation"
      icon={<AlertTriangle className="text-red-500" />}
      username={username}
    >
      <p className="text-gray-600 mb-8 border-b pb-4">
        Immediate support channels and standard escalation procedures for student safety.
      </p>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow-lg rounded-3xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Phone className="text-green-500" size={28} />
            Emergency Contacts
          </h2>
          <ul className="space-y-4">
            <li className="flex flex-col gap-1 p-4 bg-green-50 rounded-2xl border border-green-100">
              <span className="text-xs font-bold text-green-700 uppercase tracking-widest">24x7 Helpline</span>
              <span className="font-bold text-green-900 text-xl tracking-tight">‪+91 98765 43210‬</span>
            </li>
            <li className="flex flex-col gap-1 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Email Support</span>
              <span className="font-bold text-blue-900 text-lg">support@collegehelpdesk.com</span>
            </li>
          </ul>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={28} />
            Escalation Steps
          </h2>
          <ol className="space-y-3">
            <li className="p-4 bg-red-50 rounded-2xl border-l-4 border-red-400">
              <p className="font-bold text-red-900 text-sm">Step 1: Contact Counselor</p>
              <p className="text-xs text-red-700 mt-1">Contact the student's assigned counselor immediately.</p>
            </li>
            <li className="p-4 bg-orange-50 rounded-2xl border-l-4 border-orange-400">
              <p className="font-bold text-orange-900 text-sm">Step 2: Use Helpline</p>
              <p className="text-xs text-orange-700 mt-1">If counselor is unavailable or situation is urgent, call the 24x7 Helpline.</p>
            </li>
            <li className="p-4 bg-yellow-50 rounded-2xl border-l-4 border-yellow-400">
              <p className="font-bold text-yellow-900 text-sm">Step 3: Log Incident</p>
              <p className="text-xs text-yellow-700 mt-1">Log the incident in the official escalation portal for records.</p>
            </li>
            <li className="p-4 bg-gray-50 rounded-2xl border-l-4 border-gray-400">
              <p className="font-bold text-gray-900 text-sm">Step 4: Admin Notification</p>
              <p className="text-xs text-gray-700 mt-1">College administration will be notified for severe or unresolved cases.</p>
            </li>
          </ol>
        </div>
      </section>
    </AdminLayout>
  );
}
