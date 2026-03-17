"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Brain, ArrowLeft, Check } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import { apiConfig } from "@/lib/config"
import { setAuthData } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface TokenPayload {
  sub: string
  role: string
}

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    parentName: "",
    parentPhoneNumber: "",
    consent: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiMessage, setApiMessage] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const tokenRef = useRef<string | null>(null)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleApiResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Server response was not JSON:", responseText)
      throw new Error("Invalid server response. Please ensure the API is running and returning JSON.")
    }
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.msg || `Request failed with status ${response.status}`)
    }
    return data
  }

  const handleStep1Submit = async () => {
    setError(null)
    setApiMessage(null)
    setIsLoading(true)
    
    try {
      const response = await fetch(`${apiConfig.baseUrl}/register/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })
      const data = await handleApiResponse(response)
      setApiMessage(data.msg)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep2Submit = async () => {
    setError(null)
    if (!formData.otp || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const createResponse = await fetch(`${apiConfig.baseUrl}/register/verify-and-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp, 
          password: formData.password 
        }),
      })
      const createData = await handleApiResponse(createResponse)

      const loginResponse = await fetch(`${apiConfig.baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: createData.username, 
          password: formData.password 
        }),
      })
      const loginData = await handleApiResponse(loginResponse)

      tokenRef.current = loginData.access_token
      localStorage.setItem("authToken", loginData.access_token)
      localStorage.setItem("username", createData.username)
      setUsername(createData.username)

      const decodedToken = jwtDecode<TokenPayload>(loginData.access_token)
      const userRole = decodedToken.role

      if (userRole === "admin") {
        setApiMessage("Admin account verified! Redirecting to dashboard...")
        window.dispatchEvent(new Event("storage"))
        setTimeout(() => {
          router.push("/admin/dashboard")
        }, 2000)
      } else {
        setApiMessage("Account created! Just one more step to complete your profile.")
        setStep(3)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during account creation.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep3Submit = async () => {
    setError(null)
    const { firstName, lastName, phoneNumber, parentName, parentPhoneNumber, consent } = formData

    if (!firstName || !lastName || !phoneNumber || !parentName || !parentPhoneNumber) {
      setError("Please fill out all personal detail fields.")
      return
    }
    if (!consent) {
      setError("You must provide consent to continue.")
      return
    }
    if (!tokenRef.current) {
      setError("Authorization token is missing. Please complete Step 2 first.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${apiConfig.baseUrl}/register/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenRef.current}`,
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          phone_number: phoneNumber,
          parent_name: parentName,
          parent_phone_number: parentPhoneNumber,
          consent: consent,
        }),
      })
      await handleApiResponse(response)

      setApiMessage("Signup complete! Redirecting you now...")
      setAuthData(tokenRef.current, username || "", "student")

      setTimeout(() => router.push("/"), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while saving your profile.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep(s => s - 1)
    setError(null)
    setApiMessage(null)
  }

  const Stepper = ({ currentStep }: { currentStep: number }) => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((stepNumber, index) => (
        <div key={stepNumber} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
              currentStep > stepNumber
                ? "bg-primary text-primary-foreground"
                : currentStep === stepNumber
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {currentStep > stepNumber ? <Check className="w-5 h-5" /> : stepNumber}
          </div>
          {index < 2 && (
            <div
              className={`w-16 h-1 mx-2 rounded ${
                currentStep > stepNumber ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen gradient-bg flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-card rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground">Join Zenture</h1>
            <p className="text-muted-foreground text-sm">Create your account in 3 simple steps.</p>
          </div>

          <Stepper currentStep={step} />

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {apiMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              {apiMessage}
            </div>
          )}

          {username && step === 3 && (
            <div className="mb-4 p-3 bg-primary/10 text-primary rounded-lg text-sm font-medium">
              Your username is: {username}. Please save it.
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Step 1: Verify Your Email</h2>
              <div className="space-y-2">
                <Label htmlFor="email">College Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@college.edu"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <Button onClick={handleStep1Submit} className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={handleBack} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">Step 2: Create Your Account</h2>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter the code sent to your email"
                  value={formData.otp}
                  onChange={(e) => handleInputChange("otp", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button onClick={handleStep2Submit} className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Create Account"}
              </Button>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Step 3: Complete Your Profile</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentName">Parent&apos;s Name</Label>
                <Input
                  id="parentName"
                  type="text"
                  placeholder="Parent or guardian name"
                  value={formData.parentName}
                  onChange={(e) => handleInputChange("parentName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhoneNumber">Parent&apos;s Phone Number</Label>
                <Input
                  id="parentPhoneNumber"
                  type="tel"
                  placeholder="Emergency contact number"
                  value={formData.parentPhoneNumber}
                  onChange={(e) => handleInputChange("parentPhoneNumber", e.target.value)}
                />
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => handleInputChange("consent", !!checked)}
                />
                <label htmlFor="consent" className="text-sm text-muted-foreground leading-tight">
                  By checking this box, you consent to the secure storage of your personal information as per our privacy policy.
                </label>
              </div>

              <Button onClick={handleStep3Submit} className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Finish Signup"}
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
