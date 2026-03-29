"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, X, ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAuthToken } from "@/lib/auth"
import { apiConfig } from "@/lib/config"

export function PendingFeedbackPrompt() {
  const [pending, setPending] = useState<any[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = localStorage.getItem("feedback_prompt_dismissed")
    if (dismissed === "true") {
      setIsDismissed(true)
      return
    }

    const fetchPending = async () => {
      try {
        const token = getAuthToken()
        if (!token) return

        const res = await fetch(`${apiConfig.baseUrl}/pending-feedbacks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) {
            setPending(data)
            setIsVisible(true)
          }
        }
      } catch (e) {
        console.error("Failed to fetch pending feedbacks:", e)
      }
    }

    fetchPending()
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("feedback_prompt_dismissed", "true")
  }

  const handleAction = (id: string | number) => {
    const item = pending[0]
    if (item.role === 'student') {
        router.push(`/session/${item.id}`) // Or a specific feedback page if available
    } else {
        router.push(`/dashboard`) // Counselors might have a different flow
    }
  }

  if (!isVisible || pending.length === 0 || isDismissed) return null

  const latest = pending[0]

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-10 fade-in duration-500">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-[2rem] p-6 max-w-sm w-full relative overflow-hidden group">
        {/* Decorative Background Blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
        
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex gap-4">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl h-fit">
            <MessageCircle size={24} className="animate-bounce" />
          </div>
          <div className="space-y-2 pr-6">
            <h3 className="font-black text-slate-900 leading-tight">Share Your Feedback</h3>
            <p className="text-sm text-slate-500 font-medium">
              How was your session with {latest.role === 'student' ? 'Counselor' : 'Student'} {latest.counselor_name || latest.student_name}? Your feedback helps us improve.
            </p>
            <div className="pt-2">
              <Button 
                onClick={() => router.push(`/session/${latest.id}`)}
                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm h-10 group/btn"
              >
                Start Feedback
                <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
