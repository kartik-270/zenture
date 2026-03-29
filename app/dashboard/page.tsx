"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { DailyCheckIn } from "@/components/DailyCheckIn"
import { MoodReports } from "@/components/mood-reports"
import { RecommendedForYou } from "@/components/RecommendedForYou"
import { ConnectAndShare } from "@/components/ConnectAndShare"
import { AiChatBubble } from "@/components/ai-chat-bubble"
import { PendingFeedbackPrompt } from "@/components/pending-feedback-prompt"
import { 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  Users, 
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Plus
} from "lucide-react"
import { getAuthToken } from "@/lib/auth"
import { apiConfig } from "@/lib/config"
import { AppointmentDisplay, type Appointment } from "@/components/appointment-display"

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = getAuthToken()
        if (!token) return

        const response = await fetch(`${apiConfig.baseUrl}/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log("Fetched appointments:", data)

          const mappedData = data.map((apt: any) => {
            let date = apt.date
            let time = apt.time

            if (apt.appointment_time && (!date || !time)) {
              const d = new Date(apt.appointment_time)
              date = d.toISOString().split('T')[0]
              time = d.toTimeString().split(' ')[0].substring(0, 5)
            }

            let sessionId = apt.sessionId
            if (!sessionId && apt.meeting_link) {
              sessionId = apt.meeting_link.split('/').pop()
            }

            return {
              ...apt,
              date,
              time,
              sessionId,
              counselor: apt.counselor || `Counselor #${apt.counselor_id || '?'}`
            }
          })

          setAppointments(mappedData)
        }
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const now = new Date()
  const upcomingAppointments = appointments.filter((apt) => {
    try {
      const aptDate = apt.appointment_time ? new Date(apt.appointment_time) : new Date(`${apt.date}T${apt.time}`)
      const isSoon = aptDate.getTime() + (60 * 60 * 1000) >= now.getTime()
      const isActiveStatus = ["scheduled", "confirmed", "booked", "pending"].includes(apt.status.toLowerCase())
      return isSoon && isActiveStatus
    } catch (e) {
      return false
    }
  })

  const completedAppointments = appointments.filter((apt) => {
    try {
      const aptDate = apt.appointment_time ? new Date(apt.appointment_time) : new Date(`${apt.date}T${apt.time}`)
      return aptDate.getTime() + (60 * 60 * 1000) < now.getTime() || apt.status.toLowerCase() === "completed"
    } catch (e) {
      return false
    }
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen gradient-bg py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Welcome Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Wellness Dashboard</h1>
            <p className="text-slate-500 font-medium">Empowering your mental health journey with AI.</p>
          </div>

          <div className="flex flex-col gap-y-12">
             {/* Appointments Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AppointmentDisplay
                title="Upcoming Sessions"
                appointments={upcomingAppointments}
                emptyMessage="No upcoming appointments. Schedule one to get started!"
              />
              <div className="space-y-6">
                 <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                       <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 transition-colors group-hover:bg-blue-100">
                          <MessageSquare size={28} />
                       </div>
                       <div>
                          <h3 className="font-bold text-lg text-slate-900">Support Chat</h3>
                          <p className="text-slate-500 text-sm">Chat with your counselors</p>
                       </div>
                    </div>
                    <Link href="/messages" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm">Open Chat</Link>
                 </div>

                 {/* Progress Overview Inline */}
                 <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-slate-900">Streak & Stats</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100/50">
                        <p className="text-2xl font-black text-slate-900">7</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Days</p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100/50">
                        <p className="text-2xl font-black text-slate-900">3</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tests</p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100/50">
                        <p className="text-2xl font-black text-slate-900">{completedAppointments.length}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sessions</p>
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            <DailyCheckIn />
            
            <MoodReports />

            <RecommendedForYou />

            <ConnectAndShare />
          </div>
        </div>
      </main>

      <PendingFeedbackPrompt />
      <AiChatBubble />
      <Footer />
    </>
  )
}
