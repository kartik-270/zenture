import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, MessageCircle, Video, User, Phone, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface Appointment {
  id: string | number
  counselor: string
  date: string
  time: string
  mode: string
  description?: string
  status: string
  location?: string
  sessionId?: string
  appointment_time?: string
  meeting_link?: string
}

interface AppointmentDisplayProps {
  title: string
  appointments: Appointment[]
  emptyMessage: string
}

export function AppointmentDisplay({ title, appointments, emptyMessage }: AppointmentDisplayProps) {
  const router = useRouter()

  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "message":
        return <MessageCircle className="w-4 h-4" />
      case "video_call":
      case "video call":
        return <Video className="w-4 h-4" />
      case "in_person":
      case "personal meeting":
        return <User className="w-4 h-4" />
      case "voice_call":
      case "phone call":
        return <Phone className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
      case "confirmed":
      case "booked":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const isSessionStarting = (date: string, time: string) => {
    try {
      const now = new Date()
      const appointmentTime = new Date(`${date}T${time}`)
      
      const diffMinutes = (appointmentTime.getTime() - now.getTime()) / (1000 * 60)
      
      // Starting 10 mins before and up to 60 mins after
      return diffMinutes <= 10 && diffMinutes >= -60
    } catch (e) {
      return false
    }
  }

  const handleJoinSession = (apt: Appointment) => {
    const sid = apt.sessionId || apt.id
    if (!sid) {
      alert("Session ID not available.")
      return
    }
    router.push(`/session/${sid}`)
  }

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="pb-3 border-b border-slate-50">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Calendar className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt, index) => (
              <div
                key={apt.id || index}
                className="flex flex-col p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary/20 transition-all gap-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 leading-tight">{apt.counselor}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {apt.date === new Date().toISOString().split('T')[0] ? (
                            <span className="text-blue-600 font-bold uppercase">Today</span>
                          ) : (
                            apt.date
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {apt.time}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`capitalize font-medium px-2 py-0 border ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-50 gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg text-xs font-medium text-slate-600">
                    {getModeIcon(apt.mode)}
                    <span className="capitalize">{apt.mode.replace('_', ' ')}</span>
                  </div>

                  {isSessionStarting(apt.date, apt.time) && apt.mode !== 'in_person' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleJoinSession(apt)}
                      className="h-8 rounded-lg text-xs font-bold"
                    >
                      Join Session
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}

                  {apt.mode === 'in_person' && (
                    <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      In-person
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
