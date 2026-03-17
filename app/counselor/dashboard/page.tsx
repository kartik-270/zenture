'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { apiConfig } from '@/lib/config';
import { Button } from '@/components/ui/button';

export default function CounselorDashboard() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedSessions: 0,
    totalClients: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // Fetch counselor-specific data
      const response = await fetch(`${apiConfig.baseUrl}/counselor/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Counselor Dashboard</h1>
            <p className="text-slate-600 mt-2">Manage your appointments and clients</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Total Appointments</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalAppointments}</p>
                </div>
                <Calendar className="w-8 h-8 text-cyan-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Upcoming</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.upcomingAppointments}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Completed Sessions</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.completedSessions}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Total Clients</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalClients}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Upcoming Appointments</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((apt: any) => (
                  <div key={apt.id} className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{apt.studentName}</p>
                        <p className="text-sm text-slate-500">{new Date(apt.dateTime).toLocaleString()}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Join Call
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No upcoming appointments</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
