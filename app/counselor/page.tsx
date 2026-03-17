"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import CounsellorLayout from "@/components/counselor/layout";
import SessionCard from "@/components/counselor/session-card";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";
import {
  AlertTriangle,
  Shield,
  Phone,
  User,
  X,
  MessageSquare,
  Mail,
  ArrowRight,
  Clock,
  LayoutDashboard,
} from "lucide-react";

interface Appointment {
  id: number;
  studentName: string;
  date: string;
  mode: string;
  status: string;
  meeting_link: string;
  category?: "upcoming" | "completed" | "canceled" | "pending" | "active";
  formattedTime?: string;
  formattedDate?: string;
}

interface Client {
  name: string;
  status: string;
  rating: number;
}

const SESSION_DURATION = 30 * 60 * 1000;

const formatAppointments = (appointments: any[]): Appointment[] => {
  const now = Date.now();

  return appointments.map((app) => {
    // Map API fields to our internal Appointment interface
    const dateStr = app.date || app.appointment_time || app.time;
    const studentName = app.studentName || app.student_name || `Student #${app.student_id || '?'}`;
    
    const appTime = new Date(dateStr).getTime();
    const isPast = now > appTime + SESSION_DURATION;
    const isLive = now >= appTime - 10 * 60 * 1000 && now <= appTime + SESSION_DURATION;

    let category: Appointment["category"] = "upcoming";

    if (app.status === "canceled" || app.status === "rejected" || app.status === "cancelled") {
      category = "canceled";
    } else if (app.status === "pending") {
      category = "pending";
    } else if (app.status === "completed" || isPast) {
      category = "completed";
    } else if (isLive) {
      category = "active";
    }

    return {
      ...app,
      date: dateStr,
      studentName,
      category,
      formattedTime: new Date(dateStr).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      formattedDate: new Date(dateStr).toDateString() === new Date().toDateString() ? "Today" : new Date(dateStr).toLocaleDateString(),
    };
  });
};

export default function CounselorDashboard() {
  return (
    <ProtectedRoute requiredRole="counselor">
      <CounselorDashboardContent />
    </ProtectedRoute>
  );
}

function CounselorDashboardContent() {
  const router = useRouter();
  const [counsellorName, setCounsellorName] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // High-Risk States
  const [highRiskAlerts, setHighRiskAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [studentConfidential, setStudentConfidential] = useState<any>(null);
  const [showOutreachModal, setShowOutreachModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    // Connect to the Socket.IO server (base URL without /api)
    const socket = io(apiConfig.baseUrl.replace('/api', ''), {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Counselor connected to Socket.IO');
      socket.emit('join', { room: 'counselor' });
    });

    socket.on('high-risk-alert', (data) => {
      console.log('Received high-risk alert:', data);
      setHighRiskAlerts(prev => [data, ...prev]);
      toast({
        title: "CRITICAL: High-Risk Case Identified",
        description: `${data.username} identified with urgent risk factors.`,
        variant: "destructive"
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found. Please log in again.");
        setLoading(false);
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          `${apiConfig.baseUrl}/counsellor/dashboard-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();

        setCounsellorName(data.counsellorName);
        setAppointments(formatAppointments(data.appointments || []));
        setClients(data.clients || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 30000); // auto refresh every 30 sec
    return () => clearInterval(interval);
  }, []);

  const handleStartSession = (meetingLink: string) => {
    if (meetingLink) {
        if (meetingLink.startsWith('/')) {
            router.push(meetingLink);
        } else {
            window.open(meetingLink, "_blank");
        }
    }
  };

  const handleAction = async (
    apptId: number,
    newStatus: "booked" | "rejected"
  ) => {
    try {
      const token = getAuthToken();

      const res = await fetch(
        `${apiConfig.baseUrl}/appointments/${apptId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error();

      setAppointments((prev) =>
        formatAppointments(
          prev.map((app) =>
            app.id === apptId ? { ...app, status: newStatus } : app
          )
        )
      );
      toast({ title: "Success", description: `Appointment ${newStatus}` });
    } catch {
      toast({ title: "Error", description: "Failed to update appointment.", variant: "destructive" });
    }
  };

  const fetchStudentConfidential = async (studentId: number) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${apiConfig.baseUrl}/counsellor/student/${studentId}/confidential`, {
        headers: { 
          ...(token && { 'Authorization': `Bearer ${token}` }) 
        }
      });
      if (res.ok) {
        setStudentConfidential(await res.json());
        setShowOutreachModal(true);
      }
    } catch (err) {
      console.error("Failed to fetch student info:", err);
      toast({
        title: "Error",
        description: "Could not fetch student contact details.",
        variant: "destructive"
      });
    }
  };

  const handleReviewAlert = (alert: any) => {
    setSelectedAlert(alert);
    fetchStudentConfidential(alert.user_id);
  };

  const handleMarkResolved = async (alertId: number) => {
    const token = getAuthToken();
    try {
      await fetch(`${apiConfig.baseUrl}/counsellor/alerts/high-risk/${alertId}/resolve`, {
        method: 'PUT',
        headers: { 
          ...(token && { 'Authorization': `Bearer ${token}` }) 
        }
      });
      // Remove from the live list so it disappears instantly
      setHighRiskAlerts(prev => prev.filter(a => a.id !== alertId));
      setShowOutreachModal(false);
      toast({ title: "Resolved", description: "Alert marked as resolved." });
    } catch {
      toast({ title: "Error", description: "Could not mark resolved.", variant: "destructive" });
    }
  };

  if (loading)
    return <div className="text-center mt-20">Loading dashboard...</div>;

  if (error)
    return <div className="text-center mt-20 text-red-500">{error}</div>;

  const activeAppointments = appointments.filter(app => app.category === 'active');
  const pendingAppointments = appointments.filter(app => app.category === 'pending');
  const displayUpcoming = appointments.filter(app => {
    if (app.category === 'upcoming') return true;
    if (app.category === 'completed') {
      // Only show today's expired sessions
      const appDate = new Date(app.date).toDateString();
      const today = new Date().toDateString();
      return appDate === today;
    }
    return false;
  });
  const canceledAppointments = appointments.filter(app => app.category === 'canceled');

  return (
    <CounsellorLayout title="Dashboard" icon={<LayoutDashboard />}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* High-Risk Alerts Section (Real-Time) */}
          {highRiskAlerts.length > 0 && (
            <div className="bg-red-50 p-6 rounded-2xl shadow-xl border-2 border-red-200 animate-pulse-slow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
                  <AlertTriangle size={24} /> Urgent Action Required ({highRiskAlerts.length})
                </h3>
                <Shield className="text-red-500" />
              </div>
              <div className="space-y-3">
                {highRiskAlerts.map((alert, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-red-100 flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                      <p className="font-bold text-slate-900">{alert.username}</p>
                      <p className="text-sm text-red-600 font-medium italic">"{alert.message.substring(0, 60)}..."</p>
                      <div className="flex gap-2 mt-2">
                        {alert.risk_factors?.map((f: string, fi: number) => (
                          <span key={fi} className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full uppercase">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleReviewAlert(alert)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-700 transition-colors"
                    >
                      Outreach Now <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Sessions */}
          {activeAppointments.length > 0 && (
            <div className="bg-green-50 p-6 rounded-2xl shadow-xl border-2 border-green-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  Live Sessions ({activeAppointments.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAppointments.map((app) => (
                  <SessionCard
                    key={app.id}
                    title={app.studentName}
                    subtitle={
                      <div className="flex items-center gap-2">
                        <span>{app.mode === 'in_person' ? 'In Person Meeting' : app.mode.replace('_', ' ')}</span>
                        <span className="px-2 py-0.5 bg-green-500 text-white text-[8px] font-black rounded-full animate-pulse uppercase">Live</span>
                      </div>
                    }
                    meta={app.formattedTime}
                    action={
                      app.mode !== 'in_person' && (
                        <button
                          onClick={() => handleStartSession(app.meeting_link)}
                          className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-all shadow-md font-bold uppercase tracking-wider"
                        >
                          Start Session Now
                        </button>
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pending Requests Section */}
          {pendingAppointments.length > 0 && (
            <div className="bg-orange-50 p-6 rounded-2xl shadow border border-orange-200">
              <h3 className="text-xl font-semibold text-orange-800 mb-4">
                Pending Requests ({pendingAppointments.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {pendingAppointments.map((app: any) => (
                  <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                    <p className="font-bold text-slate-900">{app.studentName}</p>
                    <p className="text-sm text-slate-500">
                      {app.formattedDate} at {app.formattedTime}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAction(app.id, "booked")}
                        className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-green-700 transition-colors uppercase tracking-wider"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(app.id, "rejected")}
                        className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-lg text-xs hover:bg-slate-200 transition-colors uppercase tracking-wider"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="text-blue-600" size={24} />
              Session Schedule ({displayUpcoming.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayUpcoming.length > 0 ? (
                displayUpcoming.map((app) => (
                  <SessionCard
                    key={app.id}
                    title={app.studentName}
                    subtitle={app.mode === 'in_person' ? 'In Person Meeting' : app.mode.replace('_', ' ')}
                    meta={app.formattedDate}
                    action={
                      app.category === 'completed' ? (
                        <div className="w-full px-3 py-1.5 bg-red-50 text-red-500 text-[10px] rounded-md text-center font-black uppercase tracking-widest border border-red-100">
                          Expired
                        </div>
                      ) : (
                        <div className="w-full px-3 py-1.5 bg-slate-50 text-slate-500 text-[10px] rounded-md text-center font-black uppercase tracking-widest border border-slate-100">
                          Scheduled for {app.formattedDate}
                        </div>
                      )
                    }
                  />
                ))
              ) : (
                <p className="text-slate-500 italic py-8 text-center col-span-full">No confirmed upcoming sessions.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h4 className="text-[10px] text-blue-600 uppercase font-black tracking-widest mb-1">Upcoming</h4>
              <p className="text-3xl font-black text-blue-900">{appointments.filter(a => a.category === 'upcoming').length}</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <h4 className="text-[10px] text-orange-600 uppercase font-black tracking-widest mb-1">Pending Request</h4>
              <p className="text-3xl font-black text-orange-900">{pendingAppointments.length}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">Cancelled</h4>
              <p className="text-3xl font-black text-slate-900">{canceledAppointments.length}</p>
            </div>
          </div>

        </div>

        {/* Right Column Content */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <User className="text-blue-600" size={20} /> Client List ({clients.length})
            </h3>
            <div className="space-y-3">
              {clients.length > 0 ? (
                clients.map((client, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                        {client.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors uppercase">{client.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{client.status}</div>
                      </div>
                    </div>
                    <div className="text-[10px] bg-yellow-400/10 text-yellow-700 px-2 py-0.5 rounded-full font-black border border-yellow-200">
                      {client.rating} ★
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">No clients found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Outreach / Confidential Info Modal */}
      {showOutreachModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all border border-white/20">
            <div className="p-6 bg-red-600 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <Shield size={24} />
                <h3 className="text-xl font-black uppercase tracking-tight">Direct Outreach</h3>
              </div>
              <button onClick={() => setShowOutreachModal(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="text-center">
                <div className="w-24 h-24 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 font-black text-3xl mx-auto mb-4 border-2 border-red-100 shadow-inner">
                  {studentConfidential?.name[0]}
                </div>
                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{studentConfidential?.name}</h4>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <AlertTriangle size={12} /> High-Risk Crisis Case
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 group hover:border-blue-300 transition-all cursor-pointer">
                  <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm border border-slate-100">
                    <Phone size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Phone Number</p>
                    <p className="text-lg font-black text-slate-800">{studentConfidential?.phone}</p>
                  </div>
                  <a href={`tel:${studentConfidential?.phone}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-lg shadow-blue-200">
                    CALL
                  </a>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 group hover:border-purple-300 transition-all cursor-pointer">
                  <div className="p-3 bg-white rounded-xl text-purple-600 shadow-sm border border-slate-100">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Email Address</p>
                    <p className="text-base font-black text-slate-800 break-all">{studentConfidential?.email}</p>
                  </div>
                  <a href={`mailto:${studentConfidential?.email}`} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-xs shadow-lg shadow-purple-200">
                    EMAIL
                  </a>
                </div>

                <div className="p-5 bg-red-600 rounded-2xl text-white shadow-xl shadow-red-200">
                  <p className="text-[10px] text-red-200 uppercase font-black tracking-widest mb-3">Emergency Contact (Parent)</p>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-lg uppercase tracking-tight">{studentConfidential?.parent_name}</span>
                    <a href={`tel:${studentConfidential?.parent_phone}`} className="font-black text-xl hover:underline decoration-2 underline-offset-4">{studentConfidential?.parent_phone}</a>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => router.push(`/counselor/messages?studentId=${selectedAlert?.user_id}`)}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                  <MessageSquare size={18} /> Open Direct Chat
                </button>
                {selectedAlert?.id && (
                  <button
                    onClick={() => handleMarkResolved(selectedAlert.id)}
                    className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                  >
                    ✓ Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )
      }
    </CounsellorLayout >
  );
}
