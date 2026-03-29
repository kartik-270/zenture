"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Star, Wind, Flame, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MindfulTask {
    title: string;
    description: string;
    icon: string;
    science: string;
    duration: number;
    gradient: string;
}

const MINDFUL_TASKS: MindfulTask[] = [
    {
        title: "Mindful Breathing",
        description: "Close your eyes. Breathe in for 4 counts, hold for 4, exhale for 6. Let every thought drift away like a cloud.",
        icon: "🌬️",
        science: "Slow, controlled breathing activates the parasympathetic nervous system, reducing cortisol levels and lowering heart rate by up to 22% within 60 seconds.",
        duration: 60,
        gradient: "from-violet-400 via-purple-300 to-sky-300",
    },
    {
        title: "Gratitude Pause",
        description: "Think of three small things that went right today — a smile, a warm drink, a moment of quiet.",
        icon: "🌸",
        science: "Gratitude journaling activates the medial prefrontal cortex, releasing dopamine and serotonin. Regular practice reduces depressive symptoms by 35%.",
        duration: 60,
        gradient: "from-pink-400 via-rose-300 to-amber-200",
    },
    {
        title: "Body Scan",
        description: "Start at your toes and slowly move awareness up through every muscle group. Notice, don't judge — just release.",
        icon: "✨",
        science: "Progressive muscle relaxation lowers sympathetic nervous system activation. Regular practice reduces anxiety scores by 30% on the GAD-7 scale.",
        duration: 60,
        gradient: "from-teal-400 via-cyan-300 to-blue-200",
    },
];

// ─── Confetti ─────────────────────────────────────────────────────────────────
const COLORS = ["#a855f7", "#38bdf8", "#f472b6", "#34d399", "#fbbf24", "#60a5fa"];

function ConfettiCanvas({ active }: { active: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        type P = { x: number; y: number; vx: number; vy: number; color: string; size: number; rotation: number; rSpeed: number; shape: "c" | "r" };
        const particles: P[] = Array.from({ length: 100 }, () => ({
            x: Math.random() * canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 5,
            vy: Math.random() * 4 + 2,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            rSpeed: (Math.random() - 0.5) * 8,
            shape: Math.random() > 0.5 ? "c" : "r",
        }));

        const start = performance.now();
        const draw = (now: number) => {
            if (now - start > 4000) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.rotation += p.rSpeed;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                if (p.shape === "c") { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
                else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                ctx.restore();
            });
            rafRef.current = requestAnimationFrame(draw);
        };
        rafRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(rafRef.current);
    }, [active]);

    if (!active) return null;
    return <canvas ref={canvasRef} className="fixed inset-0 z-[9999] pointer-events-none" />;
}

// ─── Circular Timer ───────────────────────────────────────────────────────────
function CircularTimer({ seconds, total }: { seconds: number; total: number }) {
    const r = 52, circ = 2 * Math.PI * r;
    const offset = circ - (seconds / total) * circ;
    return (
        <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle cx="60" cy="60" r={r} fill="none" stroke="white" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-1000 ease-linear" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white tabular-nums leading-none">
                    {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
                </span>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">
                    {Math.round((seconds / total) * 100)}%
                </span>
            </div>
        </div>
    );
}

// ─── Growth Streak ────────────────────────────────────────────────────────────
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
function GrowthStreakBadge({ streak }: { streak: number }) {
    const filled = Math.min(streak, 7);
    return (
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-3">
                <Flame size={14} className="text-orange-300" />
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Growth Streak</span>
            </div>
            <div className="flex gap-1.5 justify-center">
                {DAY_LABELS.map((l, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${i < filled ? "bg-amber-400 shadow-md shadow-amber-400/40" : "bg-white/10"} ${i === filled - 1 && filled > 0 ? "ring-2 ring-white scale-110" : ""}`}>
                            {i < filled ? <Star size={12} className="fill-white text-white" /> : <span className="w-1.5 h-1.5 rounded-full bg-white/30 block" />}
                        </div>
                        <span className={`text-[8px] font-bold ${i < filled ? "text-amber-200" : "text-white/40"}`}>{l}</span>
                    </div>
                ))}
            </div>
            <p className="text-white/70 text-[10px] mt-2 font-medium">
                {filled === 7 ? "🎉 Perfect week!" : filled > 0 ? `${filled} day${filled > 1 ? "s" : ""} strong!` : "Start today!"}
            </p>
        </div>
    );
}

// ─── Science Dropdown ─────────────────────────────────────────────────────────
function ScienceDropdown({ text }: { text: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 text-left hover:bg-white/30 transition-all duration-300">
                <span className="flex items-center gap-2 font-semibold text-white text-xs">
                    <span>🧠</span> Why does this work?
                </span>
                <span className={`text-white/70 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
                    <ChevronDown size={16} />
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ${open ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                <div className="px-4 py-3 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
                    <p className="text-white/90 text-xs leading-relaxed">{text}</p>
                </div>
            </div>
        </div>
    );
}

// ─── Mindful Minute Full Modal Content ───────────────────────────────────────
function WellnessModal({ onClose, streak, onComplete }: { onClose: () => void; streak: number; onComplete: () => void }) {
    const [activeTask, setActiveTask] = useState(0);
    const task = MINDFUL_TASKS[activeTask];
    const [timeLeft, setTimeLeft] = useState(task.duration);
    const [running, setRunning] = useState(false);
    const [finished, setFinished] = useState(false);
    const [confetti, setConfetti] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reset when task changes
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeLeft(MINDFUL_TASKS[activeTask].duration);
        setRunning(false);
        setFinished(false);
        setConfetti(false);
    }, [activeTask]);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        setRunning(false);
                        setFinished(true);
                        setConfetti(true);
                        onComplete();
                        setTimeout(() => setConfetti(false), 4500);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [running, onComplete]);

    const handleStart = () => {
        if (finished) { setTimeLeft(task.duration); setFinished(false); }
        setRunning(r => !r);
    };

    return (
        <>
            <ConfettiCanvas active={confetti} />
            <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 sm:p-6 text-slate-900">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
                <div className={`relative z-10 w-full max-w-lg bg-gradient-to-br ${task.gradient} rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 sm:zoom-in-95 duration-500 mt-auto sm:mt-0`}>
                    {/* Ambient orbs */}
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 p-6 space-y-5">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full border border-white/30 mb-2">
                                    <Wind size={11} className="text-white animate-pulse" />
                                    <span className="text-white text-[9px] font-black uppercase tracking-widest">Daily Wellness Corner</span>
                                </div>
                                <h3 className="text-xl font-black text-white">{task.icon} {task.title}</h3>
                                <p className="text-white/75 text-sm mt-1 leading-relaxed max-w-xs">{task.description}</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 bg-white/20 border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all shrink-0">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Task Pills */}
                        <div className="flex gap-2 flex-wrap">
                            {MINDFUL_TASKS.map((t, i) => (
                                <button key={i} onClick={() => setActiveTask(i)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 ${activeTask === i ? "bg-white text-purple-600 shadow-md" : "bg-white/20 text-white border border-white/30 hover:bg-white/30"}`}>
                                    {t.icon} {t.title}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="flex-1 w-full flex flex-col items-center gap-3">
                                <CircularTimer seconds={timeLeft} total={task.duration} />
                                <button onClick={handleStart}
                                    className={`w-full max-w-[200px] px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${finished ? "bg-green-400 text-white shadow-lg hover:scale-105" : running ? "bg-white/20 border-2 border-white/50 text-white hover:bg-white/30" : "bg-white text-purple-600 shadow-lg hover:scale-105"}`}>
                                    {finished ? "✅ Again" : running ? "⏸ Pause" : "▶ Start"}
                                </button>
                                {running && <p className="text-white/60 text-xs font-bold animate-pulse">Stay present…</p>}
                                {finished && <p className="text-white font-black text-sm animate-bounce">🎉 Well done!</p>}
                            </div>
                            <div className="flex-1 w-full">
                                <GrowthStreakBadge streak={streak} />
                            </div>
                        </div>

                        {/* Science Dropdown */}
                        <ScienceDropdown text={task.science} />
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Compact Card (fits resource grid) ───────────────────────────────────────
export function DailyWellnessCorner() {
    const [open, setOpen] = useState(false);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem("wellness_streak");
        if (stored) setStreak(parseInt(stored, 10));
    }, []);

    const handleComplete = () => {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem("wellness_streak", newStreak.toString());
    };

    return (
        <>
            {/* Card — same shape as resource cards */}
            <div
                onClick={() => setOpen(true)}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer group hover:border-primary/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full"
            >
                {/* Gradient thumbnail */}
                <div className="w-full h-52 bg-gradient-to-br from-violet-400 via-purple-300 to-sky-300 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full blur-xl" />
                    <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <span className="text-5xl z-10 group-hover:scale-125 transition-transform duration-700">🌬️</span>
                    <div className="z-10 flex gap-1 mt-4">
                        {[0, 1, 2, 3, 4, 5, 6].map(i => (
                            <Star key={i} size={12} className={i < streak ? "fill-amber-300 text-amber-300" : "fill-white/30 text-white/30"} />
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-purple-600/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                           Open Corner
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <Wind size={18} className="text-primary animate-pulse" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Interactive</p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 px-3 py-1 rounded-full border border-purple-100">
                           Wellness
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">Daily Wellness Corner</h3>
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed h-[2.5rem] overflow-hidden">
                        60-second mindful exercises — breathing, gratitude & body scan. Track your 7-day streak.
                    </p>
                    <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                            {streak > 0 ? `🔥 ${streak}-day streak` : "✦ Start your streak"}
                        </span>
                        <div className="text-primary group-hover:translate-x-1 transition-transform">
                             <Wind size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Full activity modal */}
            {open && (
                <WellnessModal 
                    onClose={() => setOpen(false)} 
                    streak={streak} 
                    onComplete={handleComplete}
                />
            )}
        </>
    );
}
