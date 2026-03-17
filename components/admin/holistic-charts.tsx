"use client";

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

interface RadarData {
    subject: string;
    A: number;
    fullMark: number;
}

export const StressRadarChart: React.FC<{ data: RadarData[] }> = ({ data }) => {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar
                        name="Stress Frequency"
                        dataKey="A"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const WellnessGauge: React.FC<{ value: number }> = ({ value }) => {
    // A simple beautiful SVG gauge for wellness index
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r="40"
                        stroke="#f3f4f6"
                        strokeWidth="10"
                        fill="transparent"
                        className="transform translate-x-[0px] translate-y-[0px]"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r="40"
                        stroke="url(#wellnessGradient)"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="wellnessGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-gray-800">{value}%</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Wellness Index</span>
                </div>
            </div>
        </div>
    );
};

export const ActionableInsightCard: React.FC<{
    title: string;
    description: string;
    type: 'warning' | 'success' | 'info';
    onClick?: () => void;
}> = ({ title, description, type, onClick }) => {
    const colors = {
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        info: 'border-blue-200 bg-blue-50 text-blue-800'
    };

    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-xl border ${colors[type]} cursor-pointer transform hover:scale-[1.02] transition-all shadow-sm mb-4`}
        >
            <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                {type === 'warning' && <span>⚠️</span>}
                {type === 'success' && <span>✅</span>}
                {type === 'info' && <span>ℹ️</span>}
                {title}
            </h4>
            <p className="text-xs opacity-90">{description}</p>
        </div>
    );
};
