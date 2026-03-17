"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { ChevronRight, ChevronLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiConfig } from "@/lib/config"
import { getAuthToken } from "@/lib/auth"

const ghq12Questions = [
  { question: "Been able to concentrate on whatever you're doing?" },
  { question: "Lost much sleep over worry?" },
  { question: "Felt that you are playing a useful part in things?" },
  { question: "Felt capable of making decisions about things?" },
  { question: "Felt constantly under strain?" },
  { question: "Felt you couldn't overcome your difficulties?" },
  { question: "Been able to enjoy your normal day-to-day activities?" },
  { question: "Been able to face up to your problems?" },
  { question: "Been feeling unhappy and depressed?" },
  { question: "Been losing confidence in yourself?" },
  { question: "Been thinking of yourself as a worthless person?" },
  { question: "Been feeling reasonably happy, all things considered?" },
]

const positiveScoreOptions = [
  { label: "Better than usual", value: 0 },
  { label: "Same as usual", value: 0 },
  { label: "Less than usual", value: 1 },
  { label: "Much less than usual", value: 1 },
]

const negativeScoreOptions = [
  { label: "Not at all", value: 0 },
  { label: "No more than usual", value: 0 },
  { label: "Rather more than usual", value: 1 },
  { label: "Much more than usual", value: 1 },
]

// Questions 2, 5, 6, 9, 10, 11 are negatively worded
const negativeQuestions = [1, 4, 5, 8, 9, 10]

const getScoreInterpretation = (score: number) => {
  if (score >= 8) return { text: "High psychological distress", color: "text-red-600" }
  if (score >= 4) return { text: "Moderate psychological distress", color: "text-orange-600" }
  return { text: "Low psychological distress", color: "text-green-600" }
}

export default function GHQ12Page() {
  return (
    <ProtectedRoute requiredRole="student">
      <GHQ12Content />
    </ProtectedRoute>
  );
}

function GHQ12Content() {
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(ghq12Questions.length).fill(null))
  const [step, setStep] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const totalScore = answers.reduce((acc, val) => acc + (val || 0), 0)
  const interpretation = getScoreInterpretation(totalScore)

  const isNegativeQuestion = negativeQuestions.includes(step)
  const currentOptions = isNegativeQuestion ? negativeScoreOptions : positiveScoreOptions

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
          test_type: "GHQ-12",
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
    if (step < ghq12Questions.length - 1) {
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
    setAnswers(new Array(ghq12Questions.length).fill(null))
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
              GHQ-12 General Health Questionnaire
            </h1>
            <p className="text-muted-foreground text-center text-sm mb-8">
              Have you recently...
            </p>

            {!showResults ? (
              <>
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Question {step + 1} of {ghq12Questions.length}</span>
                    <span>{Math.round(((step + 1) / ghq12Questions.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${((step + 1) / ghq12Questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-card-foreground mb-6">
                    {step + 1}. {ghq12Questions[step].question}
                  </h2>

                  <div className="grid gap-3">
                    {currentOptions.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerChange(option.value)}
                        className={`py-4 px-6 rounded-xl text-left transition-all duration-200 ${
                          answers[step] === option.value && 
                          currentOptions.findIndex(o => o.value === option.value && o.label === option.label) === idx
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
                    {step < ghq12Questions.length - 1 ? "Next" : "Finish"}
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
                  Score range: 0-12. This is a screening tool, not a diagnosis. 
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
