import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BookOpen, Scale, Heart, ArrowRight } from "lucide-react"

const tests = [
  {
    id: "phq9",
    title: "PHQ-9",
    description: "Patient Health Questionnaire, to screen for depression.",
    icon: BookOpen,
    href: "/self-assessment/phq9",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "gad7",
    title: "GAD-7",
    description: "Generalized Anxiety Disorder, to screen for anxiety.",
    icon: Scale,
    href: "/self-assessment/gad7",
    color: "bg-green-500/10 text-green-600",
  },
  {
    id: "ghq12",
    title: "GHQ-12",
    description: "General Health Questionnaire, to screen for psychiatric distress.",
    icon: Heart,
    href: "/self-assessment/ghq12",
    color: "bg-purple-500/10 text-purple-600",
  },
]

export default function SelfAssessmentPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen gradient-bg py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Self-Assessment Tests
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Take a quick, confidential screening test to better understand your mental health. 
              Your results will not be shared and are only for your personal awareness.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {tests.map((test) => (
              <Link
                key={test.id}
                href={test.href}
                className="group bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className={`w-14 h-14 rounded-xl ${test.color} flex items-center justify-center mb-4`}>
                  <test.icon className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-card-foreground mb-2">
                  {test.title}
                </h2>
                <p className="text-muted-foreground text-sm flex-1">
                  {test.description}
                </p>
                <div className="mt-4 flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                  Take Test <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 bg-card rounded-2xl p-8 text-center">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Important Note
            </h3>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              These self-assessment tools are for informational purposes only and are not a substitute 
              for professional diagnosis. If you&apos;re experiencing mental health concerns, please consider 
              booking an appointment with one of our counsellors.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
