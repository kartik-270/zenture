import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { 
  Bot, 
  Calendar, 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  Briefcase,
  TrendingUp 
} from "lucide-react"

const features = [
  {
    title: "AI-guided First Aid Chatbot",
    desc: "Provides instant, stigma-free mental health support with coping strategies and referral guidance.",
    icon: Bot,
  },
  {
    title: "Confidential Booking",
    desc: "Enables private and secure appointments with counsellors or helpline.",
    icon: Calendar,
  },
  {
    title: "Psychoeducation Hub",
    desc: "Offers culturally relevant resources like videos, audios, and guides in regional languages.",
    icon: BookOpen,
  },
  {
    title: "Peer Support",
    desc: "Facilitates safe, moderated student-to-student discussions for shared experiences.",
    icon: Users,
  },
  {
    title: "Self-Assessments",
    desc: "Allows students to evaluate their mental well-being using standard screening tools.",
    icon: ClipboardCheck,
  },
  {
    title: "Admin Dashboard",
    desc: "Provides anonymized analytics for authorities to monitor trends and design interventions.",
    icon: BarChart3,
  },
  {
    title: "Counsellor Console",
    desc: "Gives counsellors access to case history, notes, and progress tracking tools.",
    icon: Briefcase,
  },
  {
    title: "Progress Tracking",
    desc: "Helps students and counsellors monitor improvements over time with measurable indicators.",
    icon: TrendingUp,
  },
]

const challenges = [
  "Under utilisation of counsellors",
  "Self stigma",
  "Neglecting mental wellness",
  "Personal and emotional barriers",
  "Data privacy and security",
  "Lack of accessibility",
  "Lack of early detection",
  "Financial constraints",
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen gradient-bg">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About Zenture
            </h1>
            <p className="text-lg text-muted-foreground">
              A comprehensive digital mental health platform for college students
            </p>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-16 px-4 bg-card">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-card-foreground mb-8 text-center">
              Problem Statement
            </h2>
            <div className="bg-primary/5 rounded-2xl p-8 space-y-4">
              <p className="text-foreground">
                <span className="font-semibold">Title:</span> Development of a Digital Mental Health and Psychological Support System for Students in Higher Education
              </p>
              <p className="text-foreground">
                <span className="font-semibold">Theme:</span> MedTech / BioTech / HealthTech
              </p>
              <p className="text-foreground">
                <span className="font-semibold">Category:</span> Software
              </p>
              <p className="text-foreground">
                <span className="font-semibold">Team:</span> Zenture
              </p>
            </div>
          </div>
        </section>

        {/* Key Challenges */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Key Challenges
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {challenges.map((challenge, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-card rounded-full text-sm font-medium text-card-foreground shadow-sm"
                >
                  {challenge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Approach */}
        <section className="py-16 px-4 bg-card">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-card-foreground mb-12 text-center">
              Our Technical Approach
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
