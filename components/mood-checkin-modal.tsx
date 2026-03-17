"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiConfig } from "@/lib/config";
import { getAuthToken } from "@/lib/auth";
import { CheckCircle2, ChevronRight, ChevronLeft, Save, Camera, Loader2, ShieldCheck } from "lucide-react";
import Webcam from "react-webcam";

type MoodCheckinModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (summary: string) => void;
    isSimplified?: boolean;
};

const moods = [
    { label: "Happy", emoji: "😊", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    { label: "Calm", emoji: "😌", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "Stressed", emoji: "😟", color: "bg-orange-100 text-orange-700 border-orange-200" },
    { label: "Sad", emoji: "😥", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    { label: "Anxious", emoji: "😰", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { label: "Angry", emoji: "😠", color: "bg-red-100 text-red-700 border-red-200" },
];

const sleepOptions = [
    { label: "Poor", icon: "😫" },
    { label: "Fair", icon: "🥱" },
    { label: "Good", icon: "😴" },
    { label: "Excellent", icon: "✨" },
];

const energyOptions = ["Low", "Medium", "High"];

export function MoodCheckinModal({ 
    isOpen, 
    onClose, 
    onSuccess, 
    isSimplified = false
}: MoodCheckinModalProps) {
    const [step, setStep] = useState(1);
    const [mood, setMood] = useState("");
    const [intensity, setIntensity] = useState(5);
    const [sleep, setSleep] = useState("Good");
    const [social, setSocial] = useState(false);
    const [energy, setEnergy] = useState("Medium");
    const [isSaving, setIsSaving] = useState(false);
    const [analysis, setAnalysis] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState("");
    const [detectedStress, setDetectedStress] = useState<number | null>(null);
    const webcamRef = useRef<Webcam>(null);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setMood("");
            setIntensity(5);
            setSleep("Good");
            setSocial(false);
            setEnergy("Medium");
            setAnalysis("");
            setIsSaving(false);
            setIsScanning(false);
            setScanError("");
        }
    }, [isOpen]);

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSave = async (quickMood?: string) => {
        console.log("DEBUG: handleSave called. step:", step, "isSimplified:", isSimplified, "quickMood:", quickMood);
        setIsSaving(true);
        try {
            const token = getAuthToken();
            const finalMood = quickMood || mood;
            const response = await fetch(`${apiConfig.baseUrl}/mood-checkin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` })
                },
                body: JSON.stringify({
                    mood: finalMood,
                    intensity,
                    sleep: sleep,
                    social: social,
                    energy: energy
                })
            });

            if (response.ok) {
                const data = await response.json();
                setAnalysis(data.analysis);
                setStep(6);
                window.dispatchEvent(new Event('streak-updated'));
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFacialScan = async (imageSrc: string) => {
        console.log("DEBUG: handleFacialScan called.");
        setIsScanning(true);
        setScanError("");
        try {
            const token = getAuthToken();
            // In a real environment, this might be your local inference server or an API route
            const res = await fetch(`${apiConfig.baseUrl}/chatbot/facial-analysis`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` })
                },
                body: JSON.stringify({ image: imageSrc })
            });
            const data = await res.json();
            
            if (res.ok) {
                setDetectedStress(data.stress_level);
                setIntensity(Math.round(data.stress_level));
                
                const emotionMap: {[key: string]: string} = {
                    "angry": "Angry", "fear": "Anxious", "sad": "Sad", 
                    "disgust": "Stressed", "surprise": "Stressed", "happy": "Happy", "neutral": "Calm"
                };
                setMood(emotionMap[data.emotion] || "Calm");

                // Only set local state, stop early persistence
                setStep(2);
            } else {
                setScanError(data.error || "Failed to analyze expression.");
            }
        } catch (e) {
            setScanError("Could not connect to analysis server.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleSnapshot = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            handleFacialScan(imageSrc);
        }
    };

    const handleFinish = () => {
        onSuccess(analysis);
        onClose();
        setStep(1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] overflow-hidden p-0 border-none shadow-2xl rounded-3xl">
                <div className="bg-gradient-to-br from-blue-50 to-white p-6">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold text-blue-600">
                            {step < 6 ? "Mood Check-in" : "Your Analysis"}
                        </DialogTitle>
                        <DialogDescription className="text-blue-700/70 border-b border-blue-100 pb-2">
                            {step < 6
                                ? (isSimplified ? "Quick Daily Update" : `Step ${step} of 5`)
                                : "Assessment Results"}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step 1: Mood */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-md text-slate-800">
                                    How's your mood right now?
                                </h3>
                                <button 
                                    onClick={() => setStep(0)} 
                                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all flex items-center gap-2"
                                >
                                    <Camera size={12} /> Scan
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {moods.map((m) => (
                                    <button
                                        key={m.label}
                                        onClick={() => {
                                            if (isSaving) return;
                                            setMood(m.label);
                                            if (isSimplified) {
                                                console.log("DEBUG: simplified mode - saving after Step 1 click");
                                                handleSave(m.label);
                                            }
                                        }}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mood === m.label ? m.color + " scale-105 shadow-md border-transparent" : "bg-white border-slate-100 hover:border-blue-200"}`}
                                    >
                                        <span className="text-3xl">{m.emoji}</span>
                                        <span className="text-[10px] font-black uppercase tracking-wider">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 p-2 rounded-xl">
                                <ShieldCheck size={12} className="text-green-500" />
                                <span>Privacy: No photos or videos are ever stored on our servers.</span>
                            </div>
                        </div>
                    )}

                    {/* Step 0: Facial Scan */}
                    {step === 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="font-semibold text-md text-slate-800">Looking for your expression...</h3>
                            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border-4 border-blue-200 shadow-inner">
                                {isScanning ? (
                                    <div className="absolute inset-0 z-10 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                                        <Loader2 className="animate-spin mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Analyzing Facial Cues...</p>
                                    </div>
                                ) : null}
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 left-0 w-full px-4 flex justify-center">
                                    <Button 
                                        onClick={handleSnapshot}
                                        disabled={isScanning}
                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-2xl"
                                    >
                                        Take Snapshot
                                    </Button>
                                </div>
                            </div>
                            {scanError && <p className="text-red-500 text-[10px] font-bold uppercase text-center bg-red-50 py-2 rounded-lg">{scanError}</p>}
                            <p className="text-gray-500 text-[9px] font-medium text-center italic bg-blue-50/50 p-2 rounded-lg">
                                <ShieldCheck size={10} className="inline mr-1 text-green-500" />
                                Your privacy matters. Images are processed in real-time and immediately discarded.
                            </p>
                        </div>
                    )}

                    {/* Step 2: Intensity */}
                    {step === 2 && (
                        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="font-semibold text-lg text-slate-800">How strong is this feeling?</h3>
                            <div className="px-2">
                                <div className="flex justify-between mb-4">
                                    <span className="text-sm font-medium text-slate-500">Mild</span>
                                    <span className="text-2xl font-bold text-blue-600">{intensity}</span>
                                    <span className="text-sm font-medium text-slate-500">Intense</span>
                                </div>
                                <Slider
                                    value={[intensity]}
                                    min={1}
                                    max={10}
                                    step={1}
                                    onValueChange={(val) => setIntensity(val[0])}
                                    className="my-6"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Sleep */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="font-semibold text-lg text-slate-800">How was your sleep last night?</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {sleepOptions.map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => setSleep(opt.label)}
                                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${sleep === opt.label ? "border-blue-500 bg-blue-50 shadow-sm" : "bg-white border-slate-100 hover:border-blue-200"}`}
                                    >
                                        <span className="text-2xl">{opt.icon}</span>
                                        <span className="font-medium text-slate-700">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Social */}
                    {step === 4 && (
                        <div className="space-y-8 py-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg text-slate-800">Social Check</h3>
                                    <p className="text-sm text-slate-500">Did you talk to someone today?</p>
                                </div>
                                <Switch checked={social} onCheckedChange={setSocial} />
                            </div>
                        </div>
                    )}

                    {/* Step 5: Energy */}
                    {step === 5 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="font-semibold text-lg text-slate-800">What's your energy level?</h3>
                            <div className="flex p-1 bg-slate-100 rounded-xl">
                                {energyOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => setEnergy(opt)}
                                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${energy === opt ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 6: Summary */}
                    {step === 6 && (
                        <div className="space-y-6 animate-in zoom-in duration-500">
                            <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-wider opacity-80">Report Summary</span>
                                    </div>
                                    <div className="text-md leading-relaxed font-medium min-h-[60px] flex items-center justify-center text-center">
                                        {isSaving && !analysis ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Generating analysis...</span>
                                            </div>
                                        ) : (
                                            `"${analysis || "Thanks for your check-in! Our experts are processing your wellness report."}"`
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl opacity-50" />
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-blue-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
                                <CheckCircle2 size={14} className="text-blue-500" />
                                <span>Saved to 'My Profile' for longitudinal tracking.</span>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-8 flex items-center justify-between border-t border-blue-50 pt-4">
                        {(step > 1 || step === 0) && step < 6 ? (
                            <Button variant="ghost" onClick={step === 0 ? () => setStep(1) : prevStep} className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <ChevronLeft className="mr-1" size={14} /> Back
                            </Button>
                        ) : <div />}

                        {step < 5 && step !== 0 ? (
                            <Button
                                onClick={nextStep}
                                disabled={step === 1 && !mood}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-full h-10 text-[10px] font-black uppercase tracking-widest"
                            >
                                Next <ChevronRight className="ml-1" size={14} />
                            </Button>
                        ) : step === 5 ? (
                            <Button
                                onClick={() => handleSave()}
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-full h-10 text-[10px] font-black uppercase tracking-widest"
                            >
                                {isSaving ? "Saving..." : "Save Report"} <Save className="ml-1" size={14} />
                            </Button>
                        ) : step === 6 ? (
                            <Button
                                onClick={handleFinish}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-200"
                            >
                                Close & Return
                            </Button>
                        ) : null}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
