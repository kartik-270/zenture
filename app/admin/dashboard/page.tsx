"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import {
  Users,
  Shield,
  AlertTriangle,
  Flame,
  Globe,
  Plus,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  CheckCircle2,
  X,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import AdminLayout from "@/components/admin/layout";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/protected-route";

// --- SVG Chart Components ---

const LineChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return <div className="h-40 flex items-center justify-center text-slate-400">No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 300},${100 - (d.value / max) * 100}`).join(" ");

  return (
    <div className="w-full h-40">
      <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M 0,100 L ${points} L 300,100 Z`} fill="url(#lineGrad)" />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {data.map((d, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * 300} cy={100 - (d.value / max) * 100} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
};

const PieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  let currentAngle = 0;

  return (
    <div className="w-40 h-40 relative group">
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
        {data.map((d, i) => {
          const angle = (d.value / total) * 360;
          const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          currentAngle += angle;
          const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          const largeArcFlag = angle > 180 ? 1 : 0;
          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
              fill={d.color}
              className="transition-all duration-300 hover:opacity-80 cursor-pointer"
            />
          );
        })}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-black text-slate-800 tracking-tight leading-none">{total}</span>
        <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">Total Cases</span>
      </div>
    </div>
  );
};

// --- Main Dashboard Content ---

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const [username, setUsername] = useState("Admin");
  const [stats, setStats] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [highRiskToday, setHighRiskToday] = useState<any[]>([]);
  
  // New Analytics States
  const [engagementData, setEngagementData] = useState<any>(null);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [forumActivity, setForumActivity] = useState<any>(null);
  const [counselorStatus, setCounselorStatus] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // High-Risk Alert States
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [studentConfidential, setStudentConfidential] = useState<any>(null);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);

    const token = getAuthToken();
    if (!token) return;

    const socket = io(apiConfig.baseUrl.replace('/api', ''), {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Admin connected to Socket.IO');
      socket.emit('join-room', { roomId: 'admin', userId: 'admin-user' });
    });

    socket.on('high-risk-alert', (data) => {
      setLiveAlerts(prev => [data, ...prev]);
      setStats((prev: any) => ({
        ...prev,
        unacknowledgedAlerts: (prev?.unacknowledgedAlerts || 0) + 1
      }));
      toast({
        title: "URGENT: Crisis Detection",
        description: `Potential high-risk activity detected for ${data.username}.`,
        variant: "destructive"
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchDashboardData = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [
        appointRes,
        engageRes,
        moodRes,
        resourceRes,
        overviewRes,
        counselorRes,
        forumRes,
        highRiskRes
      ] = await Promise.all([
        fetch(`${apiConfig.baseUrl}/admin/upcoming-appointments`, { headers }),
        fetch(`${apiConfig.baseUrl}/admin/analytics/engagement`, { headers }),
        fetch(`${apiConfig.baseUrl}/admin/analytics/mood`, { headers }),
        fetch(`${apiConfig.baseUrl}/admin/analytics/resources`, { headers }),
        fetch(`${apiConfig.baseUrl}/admin/analytics/overview`, { headers }),
        fetch(`${apiConfig.baseUrl}/admin/analytics/counselors-status`, { headers }),
        fetch(`${apiConfig.baseUrl}/admin/analytics/forum-activity`, { headers }),
        fetch(`${apiConfig.baseUrl}/admin/alerts/high-risk`, { headers })
      ]);

      if ([appointRes, engageRes, moodRes, resourceRes, overviewRes, counselorRes, forumRes, highRiskRes].some(r => r.status === 401)) {
        router.push("/login");
        return;
      }

      const [
        upcoming,
        engagement,
        mood,
        resources,
        overview,
        counselors,
        forum,
        highRisk
      ] = await Promise.all([
        appointRes.json(),
        engageRes.json(),
        moodRes.json(),
        resourceRes.json(),
        overviewRes.json(),
        counselorRes.json(),
        forumRes.json(),
        highRiskRes.json()
      ]);

      setUpcomingAppointments(upcoming);
      setEngagementData(engagement);
      setMoodData(mood);
      setResourceData(resources);
      setStats(overview);
      setCounselorStatus(counselors);
      setForumActivity(forum);
      setHighRiskToday(highRisk.filter((a: any) => !a.is_resolved));
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to load platform analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStudentConfidential = async (studentId: number) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${apiConfig.baseUrl}/admin/student/${studentId}/confidential`, {
        headers: { 
          ...(token && { 'Authorization': `Bearer ${token}` }) 
        }
      });
      if (res.ok) {
        setStudentConfidential(await res.json());
        setShowCrisisModal(true);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch student data.", variant: "destructive" });
    }
  };

  const handleReviewCrisis = (alert: any) => {
    setSelectedAlert(alert);
    fetchStudentConfidential(alert.user_id);
  };

  const handleResolveCrisis = async (alertId: number) => {
    const token = getAuthToken();
    try {
      await fetch(`${apiConfig.baseUrl}/admin/alerts/high-risk/${alertId}/resolve`, {
        method: 'PUT',
        headers: { 
          ...(token && { 'Authorization': `Bearer ${token}` }) 
        }
      });
      setLiveAlerts(prev => prev.filter(a => a.id !== alertId));
      setHighRiskToday(prev => prev.filter(a => a.id !== alertId));
      setShowCrisisModal(false);
      toast({ title: "Resolved", description: "Crisis marked as handled." });
    } catch {
      toast({ title: "Error", description: "Could not resolve crisis.", variant: "destructive" });
    }
  };

  if (loading) return <div className="text-center mt-20 font-black uppercase tracking-widest text-slate-400">Syncing Intelligence...</div>;
  if (error) return <div className="text-center mt-20 text-red-500 font-bold uppercase">{error}</div>;

  return (
    <AdminLayout title="Global Overview" icon={<LayoutDashboard />}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Core Metrics */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Total Users", val: stats?.totalUsers || 0, icon: Users, color: "blue", trend: stats?.activeUsers ? `${stats.activeUsers} Active` : "Syncing..." },
              { label: "Crisis Alerts", val: stats?.unacknowledgedAlerts || 0, icon: AlertTriangle, color: "red", trend: "Action Required" },
              { label: "Avg Session", val: stats?.avgSessionDuration || "0m 0s", icon: Flame, color: "orange", trend: "Intelligence" }
            ].map((m, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${m.color}-50 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                <div className="relative z-10 flex items-center justify-between mb-6">
                  <div className={`p-4 bg-${m.color}-50 text-${m.color}-600 rounded-2xl shadow-sm border border-${m.color}-100`}>
                    <m.icon size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.trend}</span>
                </div>
                <h4 className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">{m.label}</h4>
                <div className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{m.val}</div>
              </div>
            ))}
          </div>

          {/* Urgent Alerts Section */}
          {(liveAlerts.length > 0 || highRiskToday.length > 0) && (
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-700"></div>
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Immediate Crisis Review ({liveAlerts.length + highRiskToday.length})</h3>
                </div>
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {[...liveAlerts, ...highRiskToday].map((alert, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 hover:border-white/20 transition-all group/card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center font-black text-red-500">
                          {alert.username[0]}
                        </div>
                        <span className="font-black uppercase tracking-tight">{alert.username}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-red-500 text-white rounded-lg">Critical</span>
                    </div>
                    <p className="text-sm text-slate-400 italic mb-6 leading-relaxed line-clamp-2">"{alert.message}"</p>
                    <button
                      onClick={() => handleReviewCrisis(alert)}
                      className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-transform"
                    >
                      Emergency Assessment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                <TrendingUp className="text-blue-600" size={24} /> Engagement Growth
              </h3>
              <div className="space-y-4">
                 <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-600 rounded-full"></div> New Users</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full"></div> Sessions</span>
                 </div>
                 <LineChart data={engagementData?.newUsers || []} />
                 <div className="pt-4 border-t border-slate-50">
                    <LineChart data={engagementData?.activeSessions || []} />
                 </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-xl font-black uppercase tracking-tighter">Mood Analysis</h3>
              <div className="space-y-6">
                 <div className="grid grid-cols-3 gap-2 text-[8px] font-black uppercase tracking-widest text-center mb-4">
                    <div className="text-green-600">Low</div>
                    <div className="text-orange-500">Medium</div>
                    <div className="text-red-600">High</div>
                 </div>
                 <div className="space-y-4">
                    {moodData.slice(-3).map((m, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span>{m.day}</span>
                                <span className="text-slate-400">Total: {m.low + m.medium + m.high}</span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex border border-slate-200/50">
                                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(m.low / (m.low + m.medium + m.high || 1)) * 100}%` }} />
                                <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${(m.medium / (m.low + m.medium + m.high || 1)) * 100}%` }} />
                                <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(m.high / (m.low + m.medium + m.high || 1)) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Sidebars */}
        <div className="space-y-8">
          {/* Upcoming Appointments */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} /> Schedule
            </h3>
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((app, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-black text-slate-900 text-xs uppercase">{app.student_username}</p>
                      <CheckCircle2 size={14} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {new Date(app.appointment_time).toDateString() === new Date().toDateString() ? (
                        <span className="text-blue-600 mr-2">Today</span>
                      ) : null}
                      {new Date(app.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center opacity-30 grayscale">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zero Pending</p>
                </div>
              )}
            </div>
          </div>

          {/* Counselor Activity */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Expert Status</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Online Now</span>
                <span className="text-2xl font-black text-green-500">{counselorStatus?.online || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available</span>
                <span className="text-2xl font-black text-blue-400">{counselorStatus?.available || 0}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Response Efficiency</p>
                <p className="text-sm font-black text-white uppercase tracking-tight">{counselorStatus?.avgWaitTime || "Analyzing..."} Wait</p>
              </div>
            </div>
          </div>

          {/* Forum Activity */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
               <Globe className="text-blue-500" size={20} /> Social Reach
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Posts (24h)</span>
                <span className="text-xl font-black text-slate-900">{forumActivity?.newPosts24h || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Threads</span>
                <span className="text-xl font-black text-slate-900">{forumActivity?.activeThreads || 0}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>

          {/* Top Resources Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Top Resource Assets</h3>
            <div className="space-y-4">
              {resourceData && resourceData.length > 0 ? (
                resourceData.slice(0, 5).map((res, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[120px]">{res.title}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{res.type}</p>
                    </div>
                    <span className="text-[10px] font-black text-blue-600">{res.views} Views</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] font-black text-slate-300 uppercase text-center py-4">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Response Modal */}
      {showCrisisModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col transform transition-all border border-white/20">
            <div className="p-8 bg-red-600 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-4">
                <AlertTriangle size={32} />
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Crisis Assessment</h3>
                  <p className="text-[10px] text-red-100 font-black uppercase tracking-widest opacity-80 mt-1">Direct Outreach Protocol Active</p>
                </div>
              </div>
              <button onClick={() => setShowCrisisModal(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="flex items-center gap-8 border-b border-slate-100 pb-8">
                <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 font-black text-4xl border-2 border-red-100 shadow-inner">
                  {studentConfidential?.name ? studentConfidential.name[0] : "?"}
                </div>
                <div>
                  <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{studentConfidential?.name || "Student"}</h4>
                  <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-200">High Risk Factor</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Active Live File</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Direct Phone</p>
                  <p className="text-lg font-black text-slate-800">{studentConfidential?.phone || "Private"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Official Email</p>
                  <p className="text-base font-black text-slate-800 truncate">{studentConfidential?.email || "Private"}</p>
                </div>
                <div className="space-y-6 col-span-2 p-6 bg-red-50 rounded-[2rem] border border-red-100 mt-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <p className="text-[10px] text-red-600 font-black uppercase tracking-widest mb-4 relative z-10">Emergency Guardian Information</p>
                  <div className="flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Primary Guardian</p>
                      <p className="text-lg font-black text-slate-800 uppercase leading-none">{studentConfidential?.parent_name || "LOCKED"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Emergency Line</p>
                      <p className="text-xl font-black text-red-600 leading-none">{studentConfidential?.parent_phone || "LOCKED"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => handleResolveCrisis(selectedAlert.id)}
                  className="flex-1 py-5 bg-green-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl shadow-green-100 uppercase tracking-widest text-[10px]"
                >
                  <CheckCircle2 size={18} /> Mark as Stabilized
                </button>
                <div className="flex gap-2">
                  <a href={`tel:${studentConfidential?.phone}`} className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                    <Phone size={24} />
                  </a>
                  <a href={`mailto:${studentConfidential?.email}`} className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 hover:bg-black transition-all">
                    <Mail size={24} />
                  </a>
                </div>
              </div>

              <p className="text-[9px] text-slate-400 font-bold text-center italic mt-4 uppercase tracking-widest">Every interaction with crisis data is logged for legal compliance.</p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
