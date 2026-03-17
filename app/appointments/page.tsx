"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { MessageCircle, Video, User, Phone, Check, ChevronLeft, MapPin, CalendarDays } from "lucide-react"
import { apiConfig } from "@/lib/config"
import { getAuthToken, isAuthenticated } from "@/lib/auth"

interface Counselor {
  id: number
  user_id: number
  name: string
  specialty: string
  reviews: number
  image: string
  meeting_location: string
}

interface TimeSlot {
  time: string
  available: boolean
}

interface Appointment {
  counselor: string
  date: string
  time: string
  mode: string
  description: string
  status: string
  location?: string
}

export default function AppointmentPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <AppointmentContent />
    </ProtectedRoute>
  );
}

function AppointmentContent() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [selectedCounselorProfileId, setSelectedCounselorProfileId] = useState<number | null>(null)
  const [selectedCounselorUserId, setSelectedCounselorUserId] = useState<number | null>(null)
  const [selectedCounselorDetails, setSelectedCounselorDetails] = useState<Counselor | null>(null)
  const [mode, setMode] = useState("")
  const [notes, setNotes] = useState("")
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const communicationModes = [
    { id: "Message", label: "Message", icon: MessageCircle },
    { id: "Video Call", label: "Video Call", icon: Video },
    { id: "Personal Meeting", label: "In Person", icon: User },
    { id: "Phone Call", label: "Phone Call", icon: Phone },
  ]


  const [loggedIn, setLoggedIn] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      setLoggedIn(false)
      return
    }
    setLoggedIn(true)

    const fetchCounselors = async () => {
      try {
        const token = getAuthToken()
        const res = await fetch(`${apiConfig.baseUrl}/counselors`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch counselors")
        const data = await res.json()
        setCounselors(data || [])
      } catch (err) {
        console.error("Failed to fetch counselors:", err)
      }
    }
    fetchCounselors()
  }, [])

  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedDate && selectedCounselorProfileId) {
        setIsLoading(true)
        const token = getAuthToken()
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
        const day = String(selectedDate.getDate()).padStart(2, "0")
        const formattedDate = `${year}-${month}-${day}`

        try {
          const res = await fetch(
            `${apiConfig.baseUrl}/counselor/profile/${selectedCounselorProfileId}?date=${formattedDate}`,
            { 
              headers: { 
                ...(token && { "Authorization": `Bearer ${token}` }) 
              } 
            }
          )

          if (!res.ok) {
            throw new Error(`Failed to fetch slots: ${res.statusText}`)
          }

          const data = await res.json()
          setAvailableSlots(data.available_slots || [])
        } catch (err) {
          console.error("Failed to fetch slots:", err)
          setAvailableSlots([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setAvailableSlots([])
      }
    }

    fetchSlots()
  }, [selectedDate, selectedCounselorProfileId])

  const handleStep1Next = () => {
    if (!selectedDate || !selectedCounselorProfileId || !selectedCounselorUserId || !selectedTime) {
      alert("Please select a counselor, date, and a time slot.")
      return
    }
    const counselor = counselors.find((c) => c.id === selectedCounselorProfileId)
    if (!counselor) {
      alert("Selected counselor not found.")
      return
    }
    setSelectedCounselorDetails(counselor)
    setStep(2)
  }

  const handleStep2Next = async () => {
    if (!mode || !selectedCounselorDetails || !selectedTime || !selectedDate) {
      alert("Please select a mode of communication.")
      return
    }

    setIsLoading(true)
    const token = getAuthToken()
    if (!token) {
      alert("You are not authenticated. Please log in.")
      setIsLoading(false)
      return
    }

    const modeMap: Record<string, string> = {
      Message: "message",
      "Video Call": "video_call",
      "Personal Meeting": "in_person",
      "Phone Call": "voice_call",
    }

    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
    const day = String(selectedDate.getDate()).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}`

    try {
      const res = await fetch(`${apiConfig.baseUrl}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          counselor_id: selectedCounselorUserId,
          appointment_date: formattedDate,
          appointment_time: selectedTime,
          mode: modeMap[mode],
          description: notes,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setAppointment({
          counselor: selectedCounselorDetails.name,
          date: formattedDate,
          time: data.appointment.time,
          mode: mode,
          description: notes,
          status: data.appointment.status,
          location: selectedCounselorDetails.meeting_location,
        })
        setStep(3)
      } else {
        alert(data.error || "Booking failed. " + (data.msg || "Please try another slot."))
      }
    } catch {
      alert("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCalendar = () => {
    if (!appointment) return
    const startDateTime = new Date(`${appointment.date}T${appointment.time}`)
    const endDateTime = new Date(startDateTime.getTime() + 15 * 60000)
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=Counseling+Session+with+${appointment.counselor}&dates=${startDateTime.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${endDateTime.toISOString().replace(/[-:]/g, "").split(".")[0]}Z&details=${appointment.description}&location=Online&sf=true&output=xml`
    window.open(url, "_blank")
  }

  const filteredSlots = availableSlots.filter((slot) => {
    if (!selectedDate) return true
    const now = new Date()
    const isToday =
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear()

    if (isToday) {
      const [slotHours, slotMins] = slot.time.split(":").map(Number)
      const currentHours = now.getHours()
      const currentMins = now.getMinutes()
      if (slotHours < currentHours) return false
      if (slotHours === currentHours && slotMins <= currentMins) return false
    }
    return true
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen gradient-bg py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground text-center mb-8">
            Book a Session with a Counselor
          </h1>

          {!loggedIn ? (
            <div className="bg-card rounded-2xl shadow-lg p-8 text-center">
              <p className="text-muted-foreground mb-6">
                To schedule an appointment, you have to log in.
              </p>
              <Button onClick={() => router.push("/login")}>Go to Login</Button>
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-lg p-8">
              {/* Step Indicator */}
              <div className="flex items-center justify-center mb-8">
                {[1, 2, 3].map((s, index) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                        step >= s
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > s ? <Check className="w-5 h-5" /> : s}
                    </div>
                    {index < 2 && (
                      <div
                        className={`w-16 h-1 mx-2 rounded ${
                          step > s ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Select Counselor, Date, Time */}
              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground mb-4">
                      Choose Counselor
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {counselors.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedCounselorProfileId(c.id)
                            setSelectedCounselorUserId(c.user_id)
                          }}
                          className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                            selectedCounselorProfileId === c.id
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{c.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Specialty: {c.specialty}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {c.reviews} Reviews
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <h2 className="text-lg font-semibold text-card-foreground mb-4">
                        Select Date
                      </h2>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date)
                          setSelectedTime(null)
                        }}
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return date < today
                        }}
                        className="rounded-xl border"
                      />
                    </div>

                    {selectedDate && selectedCounselorProfileId && (
                      <div>
                        <h2 className="text-lg font-semibold text-card-foreground mb-4">
                          Select Time Slot
                        </h2>
                        {isLoading ? (
                          <p className="text-muted-foreground">Loading slots...</p>
                        ) : filteredSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {filteredSlots.map((slot, i) => (
                              <button
                                key={i}
                                disabled={!slot.available}
                                onClick={() => setSelectedTime(slot.time)}
                                className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                                  !slot.available
                                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                                    : selectedTime === slot.time
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-foreground hover:border-primary"
                                }`}
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No slots available</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleStep1Next}>Next</Button>
                  </div>
                </div>
              )}

              {/* Step 2: Select Mode */}
              {step === 2 && (
                <div className="space-y-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </button>

                  <h2 className="text-lg font-semibold text-card-foreground">
                    Select Mode of Communication
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {communicationModes.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`flex flex-col items-center p-6 rounded-xl border transition-all ${
                          mode === m.id
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <m.icon className="w-8 h-8 text-primary mb-2" />
                        <span className="text-sm font-medium text-card-foreground">
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {mode === "Personal Meeting" && selectedCounselorDetails?.meeting_location && (
                    <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-card-foreground">Meeting Location</p>
                        <p className="text-muted-foreground text-sm">
                          {selectedCounselorDetails.meeting_location}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-card-foreground mb-2 block">
                      Additional Notes (Optional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific topics you'd like to discuss..."
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={handleStep2Next} disabled={isLoading}>
                      {isLoading ? "Booking..." : "Confirm"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && appointment && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-card-foreground">
                    Appointment Confirmed!
                  </h2>
                  <div className="bg-muted rounded-xl p-6 text-left space-y-3">
                    <p className="text-card-foreground">
                      <span className="font-medium">Counselor:</span> {appointment.counselor}
                    </p>
                    <p className="text-card-foreground">
                      <span className="font-medium">Date:</span> {appointment.date}
                    </p>
                    <p className="text-card-foreground">
                      <span className="font-medium">Time:</span> {appointment.time}
                    </p>
                    <p className="text-card-foreground">
                      <span className="font-medium">Mode:</span> {appointment.mode}
                    </p>
                    {appointment.mode === "Personal Meeting" && appointment.location && (
                      <p className="text-card-foreground">
                        <span className="font-medium">Location:</span> {appointment.location}
                      </p>
                    )}
                    <p className="text-card-foreground">
                      <span className="font-medium">Status:</span> {appointment.status}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" onClick={handleAddToCalendar}>
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Add to Calendar
                    </Button>
                    <Button onClick={() => router.push("/dashboard")}>
                      Go to Dashboard
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
