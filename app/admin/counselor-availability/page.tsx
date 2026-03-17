"use client";

import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  Clock,
  Phone,
  Plus,
  X,
  Edit2
} from "lucide-react";
import AdminLayout from "@/components/admin/layout";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";

interface Counselor {
  id: number;
  user_id: number;
  name: string;
  specialization: string;
  availability: {
    days: string[];
    timeRange: string;
  };
  contact: string;
  image: string;
  meeting_location: string;
}

export default function CounselorAvailabilityPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <CounselorAvailabilityContent />
        </ProtectedRoute>
    );
}

function CounselorAvailabilityContent() {
  const [username, setUsername] = useState("Admin");
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCounselorId, setCurrentCounselorId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    specialization: "",
    days: [] as string[],
    startTime: "09:00",
    endTime: "17:00",
    meetingLocation: ""
  });

  const { toast } = useToast();
  const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${apiConfig.baseUrl}/counselors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const normalizedData = data.map((c: any) => ({
          ...c,
          availability: typeof c.availability === 'object' && c.availability.days
            ? c.availability
            : { days: ["Mon", "Fri"], timeRange: "09:00-17:00" }
        }));
        setCounselors(normalizedData);
      }
    } catch (error) {
      console.error("Failed to fetch counselors", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({
      username: "",
      password: "",
      email: "",
      specialization: "",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      startTime: "09:00",
      endTime: "17:00",
      meetingLocation: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (counselor: Counselor) => {
    setIsEditing(true);
    setCurrentCounselorId(counselor.id);

    const [start, end] = (counselor.availability.timeRange || "09:00-17:00").split("-");

    setFormData({
      username: counselor.name,
      password: "",
      email: counselor.contact || "",
      specialization: counselor.specialization,
      days: counselor.availability.days || [],
      startTime: start || "09:00",
      endTime: end || "17:00",
      meetingLocation: counselor.meeting_location || ""
    });
    setIsModalOpen(true);
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const days = prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day];
      return { ...prev, days };
    });
  };

  const handleSubmit = async () => {
    try {
      const token = getAuthToken();
      const url = isEditing
        ? `${apiConfig.baseUrl}/admin/counselors/${currentCounselorId}`
        : `${apiConfig.baseUrl}/admin/counselors`;

      const method = isEditing ? "PUT" : "POST";

      const body: any = {
        username: formData.username,
        email: formData.email,
        specialization: formData.specialization,
        availability: {
          days: formData.days,
          timeRange: `${formData.startTime}-${formData.endTime}`
        },
        meeting_location: formData.meetingLocation
      };

      if (formData.password) {
        body.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast({ title: `Counselor ${isEditing ? 'updated' : 'added'} successfully` });
        setIsModalOpen(false);
        fetchCounselors();
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.msg, variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to save counselor", variant: "destructive" });
    }
  };

  return (
    <AdminLayout
      title="Counselor Availability"
      icon={<Stethoscope className="text-blue-500" />}
      username={username}
      actions={
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md font-bold"
        >
          <Plus size={20} /> Add Counselor
        </button>
      }
    >
      <div className="mb-6">
        <p className="text-gray-600">
          Check and update the availability of counselors and manage their profiles.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {counselors.map((counselor) => (
            <div
              key={counselor.id}
              className="bg-white shadow-lg rounded-3xl p-6 flex flex-col space-y-4 hover:shadow-xl transition-all duration-300 border border-gray-100 relative group"
            >
              <button
                onClick={() => handleOpenEditModal(counselor)}
                className="absolute top-6 right-6 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-blue-50 rounded-full"
              >
                <Edit2 size={20} />
              </button>

              <div className="flex items-center gap-4">
                <img src={counselor.image || "https://res.cloudinary.com/dt9vufnpx/image/upload/v1740924976/default_pfp_f2c3b8.png"} alt={counselor.name} className="w-16 h-16 rounded-full object-cover bg-gray-100 border-2 border-white shadow-sm" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {counselor.name}
                  </h2>
                  <p className="text-blue-600 font-bold text-sm tracking-tight">{counselor.specialization}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                    <Clock size={16} className="text-green-500" /> Availability
                  </div>
                  <div className="pl-6 space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {counselor.availability.days.map(day => (
                        <span key={day} className="px-2 py-0.5 bg-gray-50 rounded-md text-[10px] border border-gray-200 font-bold text-gray-600 uppercase">
                          {day}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{counselor.availability.timeRange}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                  <Phone size={18} className="text-blue-500" />
                  <span className="text-sm font-medium">{counselor.contact}</span>
                </div>
              </div>
            </div>
          ))}
          {counselors.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                  <Stethoscope size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-gray-500 font-medium">No counselors registered yet.</p>
              </div>
          )}
        </section>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                {isEditing ? `Edit Profile` : "Register Counselor"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Username / Name</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    placeholder="Full Name"
                    disabled={isEditing}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    placeholder="counselor@example.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Password {isEditing && <span className="text-xs font-normal text-gray-400">(Keep blank to stay same)</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    placeholder="••••••••"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Professional Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    placeholder="e.g. Clinical Psychologist"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Office Location / Online URL</label>
                  <input
                    type="text"
                    value={formData.meetingLocation}
                    onChange={(e) => setFormData({ ...formData, meetingLocation: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    placeholder="Room 101, Medical Block or Meeting Link"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" /> Availability Settings
                </h4>

                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Available Days</label>
                <div className="flex flex-wrap gap-2 mb-6">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.days.includes(day)
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Shift Starts</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Shift Ends</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={formData.days.length === 0}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
                >
                  {isEditing ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
