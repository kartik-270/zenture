"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { ChevronRight, ChevronLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiConfig } from "@/lib/config"
import { getAuthToken } from "@/lib/auth"

const phq9Questions = [
  { question: "Little interest or pleasure in doing things?" },
  { question: "Feeling down, depressed, or hopeless?" },
  { question: "Trouble falling or staying asleep, or sleeping too much?" },
  { question: "Feeling tired or having little energy?" },
  { question: "Poor appetite or overeating?" },
  { question: "Feeling bad about yourself—or that you are a failure or have let yourself or your family down?" },
  { question: "Trouble concentrating on things, such as reading the newspaper or watching television?" },
  { question: "Moving or speaking so slowly that other people could have noticed? Or the opposite—being so fidgety or restless that you have been moving around a lot more than usual?" },
  { question: "Thoughts that you would be better off dead or of hurting yourself in some way?" },
]

const scoreOptions = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
]

export default function PHQ9Page() {
  return (
    <ProtectedRoute requiredRole="student">
      <PHQ9Content />
    </ProtectedRoute>
  );
}

function PHQ9Content() {
  const getScoreInterpretation = (score: number) => {
    if (score >= 20) return { text: "Severe depression", color: "text-red-600" }
    if (score >= 15) return { text: "Moderately severe depression", color: "text-orange-600" }
    if (score >= 10) return { text: "Moderate depression", color: "text-yellow-600" }
    if (score >= 5) return { text: "Mild depression", color: "text-blue-600" }
    return { text: "Minimal depression", color: "text-green-600" }
  }

  const [answers, setAnswers] = useState<(number | null)[]>(new Array(phq9Questions.length).fill(null))
  const [step, setStep] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const totalScore: number = answers.reduce((acc: number, val) => acc + (val || 0), 0)
  const interpretation = getScoreInterpretation(totalScore)

  useEffect(() => {
    if (showResults) {
      saveResult()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults])

  const saveResult = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      await fetch(`${apiConfig.baseUrl}/assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          test_type: "PHQ-9",
          score: totalScore,
          interpretation: interpretation.text,
        }),
      })
    } catch (e) {
      console.error("Failed to save assessment", e)
    }
  }

  const handleAnswerChange = (value: number) => {
    const newAnswers = [...answers]
    newAnswers[step] = value
    setAnswers(newAnswers)
  }

  const handleNextStep = () => {
    if (step < phq9Questions.length - 1) {
      setStep(step + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePreviousStep = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleRetakeTest = () => {
    setAnswers(new Array(phq9Questions.length).fill(null))
    setStep(0)
    setShowResults(false)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen gradient-bg py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-card-foreground text-center mb-2">
              PHQ-9 Depression Test
            </h1>
            <p className="text-muted-foreground text-center text-sm mb-8">
              Over the last two weeks, how often have you been bothered by any of the following problems?
            </p>

            {!showResults ? (
              <>
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Question {step + 1} of {phq9Questions.length}</span>
                    <span>{Math.round(((step + 1) / phq9Questions.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${((step + 1) / phq9Questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-card-foreground mb-6">
                    {step + 1}. {phq9Questions[step].question}
                  </h2>

                  <div className="grid gap-3">
                    {scoreOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswerChange(option.value)}
                        className={`py-4 px-6 rounded-xl text-left transition-all duration-200 ${
                          answers[step] === option.value
                            ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={step === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={answers[step] === null}
                  >
                    {step < phq9Questions.length - 1 ? "Next" : "Finish"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-card-foreground mb-4">
                  Your Results
                </h2>
                <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-primary">{totalScore}</span>
                </div>
                <p className={`text-xl font-medium mb-6 ${interpretation.color}`}>
                  {interpretation.text}
                </p>
                <p className="text-muted-foreground text-sm mb-8">
                  Score range: 0-27. This is a screening tool, not a diagnosis. 
                  Please consult a mental health professional for proper evaluation.
                </p>
                <Button onClick={handleRetakeTest} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Test
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
